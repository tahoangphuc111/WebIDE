import subprocess
import tempfile
import os
import time
import psutil
import threading
import hashlib
import shutil
from django.conf import settings

CACHE_DIR = os.path.join(settings.BASE_DIR, 'compilation_cache')
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# Max output size in characters (approx bytes) to prevent memory overflow
MAX_OUTPUT_SIZE = 50000  # 50KB

def get_code_hash(code, language):
    """Returns SHA256 hash of code + language."""
    return hashlib.sha256(f"{language}::{code}".encode('utf-8')).hexdigest()

def execute_code(code, language, input_data=""):
    """
    Executes code in a temporary directory and returns:
    stdout, stderr, success, duration (s), memory (KB), created_files (dict)
    """
    compiler_paths = getattr(settings, 'COMPILER_PATHS', {})
    timeout = getattr(settings, 'EXECUTION_TIMEOUT', 5)

    code_hash = get_code_hash(code, language)
    cached_exe = None
    
    # Check if we can use cache (only for compiled languages)
    use_cache = language in ["c", "cpp", "pascal", "go", "asm"]
    
    # Define cache path
    if use_cache:
        cached_exe_name = f"{code_hash}.exe"
        cached_exe_path = os.path.join(CACHE_DIR, cached_exe_name)
        if os.path.exists(cached_exe_path):
            cached_exe = cached_exe_path

    with tempfile.TemporaryDirectory() as temp_dir:
        # File extensions and run commands
        if language == "python":
            filename = "main.py"
            cmd = [compiler_paths.get("python", "python"), filename]
        elif language == "c":
            filename = "main.c"
            exe = os.path.join(temp_dir, "main.exe")
            compile_cmd = [compiler_paths.get("c", "gcc"), filename, "-o", exe]
            cmd = [exe]
        elif language == "cpp":
            filename = "main.cpp"
            exe = os.path.join(temp_dir, "main.exe")
            compile_cmd = [compiler_paths.get("cpp", "g++"), filename, "-o", exe]
            cmd = [exe]
        elif language == "pascal":
            filename = "main.pas"
            exe = os.path.join(temp_dir, "main.exe")
            compile_cmd = [compiler_paths.get("pascal", "fpc"), filename]
            cmd = [exe]
        elif language == "javascript":
            filename = "main.js"
            cmd = [compiler_paths.get("javascript", "node"), filename]
        elif language == "java":
            filename = "Main.java"
            # Compile to .class
            compile_cmd = [compiler_paths.get("java", "javac"), filename]
            # Run the compiled class (cp . Main)
            cmd = [compiler_paths.get("java_run", "java"), "-cp", temp_dir, "Main"]
        elif language == "dart":
            filename = "main.dart"
            cmd = [compiler_paths.get("dart", "dart"), "run", filename]
        elif language == "pypy":
            filename = "main.py"
            cmd = [compiler_paths.get("pypy", "pypy"), filename]
        elif language == "go":
            filename = "main.go"
            exe = os.path.join(temp_dir, "main.exe")
            compile_cmd = [compiler_paths.get("go", "go"), "build", "-o", exe, filename]
            cmd = [exe]
        elif language == "kotlin":
            filename = "Main.kt"
            jar = os.path.join(temp_dir, "main.jar")
            compile_cmd = [compiler_paths.get("kotlin", "kotlinc"), filename, "-include-runtime", "-d", jar]
            cmd = [compiler_paths.get("java_run", "java"), "-jar", jar]
        elif language == "asm":
            filename = "main.asm"
             # Assuming NASM for x86/x64 and MinGW GCC for linking
            obj = os.path.join(temp_dir, "main.obj")
            exe = os.path.join(temp_dir, "main.exe")
            # nasm -f win64 main.asm -o main.obj
            # gcc main.obj -o main.exe
            # For simplicity, we assume one compile step if using a driver or script,
            # but usually it's two. We'll handle 2-step in the compile logic below if needed.
            # But wait, our compile logic below assumes 1 executeable command.
            # We will use a small workaround or assume a custom script or just simplified flow.
            # Let's try to do it in one pass if possible, or adapt the generic logic.
            # For now, let's treat it as "nasm" producing object, and we need to link.
            # The current structure supports ONE compile_cmd.
            # We can chain commands using shell=True but that's unsafe.
            # Workaround: "gcc -x assembler" handles AT&T syntax.
            # If user wants NASM, we need nasm + gcc.
            # Let's stick to GCC for "asm" as it can compile .s (assembly) directly.
            filename = "main.s"
            exe = os.path.join(temp_dir, "main.exe")
            compile_cmd = [compiler_paths.get("c", "gcc"), filename, "-o", exe]
            cmd = [exe]
        else:
            return "", "Unsupported language", False, 0, 0, {}

        # Write code to file (always needed for Python or fresh compile)
        file_path = os.path.join(temp_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)

        # Compilation Logic
        if language in ["c", "cpp", "pascal", "java", "go", "kotlin", "asm"]:
            if cached_exe:
                # COPY cached exe to temp dir to run it
                shutil.copy(cached_exe, exe)
            else:
                # COMPILE
                try:
                    compile_proc = subprocess.run(
                        compile_cmd,
                        cwd=temp_dir,
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if compile_proc.returncode != 0:
                        return "", f"Compilation Error:\n{compile_proc.stderr}\n{compile_proc.stdout}", False, 0, 0, {}
                    
                    # Cache the successful binary
                    if os.path.exists(exe):
                        shutil.copy(exe, cached_exe_path)
                        
                except subprocess.TimeoutExpired:
                    return "", "Compilation Timed Out", False, 0, 0, {}
                except Exception as e:
                    return "", f"Compilation Failed: {str(e)}", False, 0, 0, {}

        # Execution with monitoring
        start_time = time.perf_counter()
        peak_memory_kb = 0
        
        try:
            process = subprocess.Popen(
                cmd,
                cwd=temp_dir,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Thread to poll memory usage
            def monitor_memory(proc):
                nonlocal peak_memory_kb
                try:
                    p = psutil.Process(proc.pid)
                    while proc.poll() is None:
                        try:
                            # Handling fast execution where process dies before we check
                            mem = p.memory_info().rss / 1024  # KB
                            if mem > peak_memory_kb:
                                peak_memory_kb = mem
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            break
                        time.sleep(0.1)  # OPTIMIZED: Reduced polling frequency
                except:
                    pass

            monitor_thread = threading.Thread(target=monitor_memory, args=(process,))
            monitor_thread.start()

            try:
                stdout_data = []
                stderr_data = []
                total_out = 0
                total_err = 0
                
                # We use communicate with a timeout, but if we want to limit size we should ideally read streams.
                # However, for simplicity and stability with the current threading model, we will use communicate 
                # but we rely on the OS pipe buffer and the timeout to save us from infinite loops.
                # To be safer against strictly large output, we'd need a select loop, but that's complex on Windows.
                # Let's stick to communicate but TRUNCATE the result immediately to release memory if possible, 
                # although Python's strings are immutable so we might spike.
                
                # A better approach for "Low Memory" without complex async code:
                # We can't easily limit communicate's buffer.
                # But we can limit what we store.
                
                stdout, stderr = process.communicate(input=input_data, timeout=timeout)
                
                if len(stdout) > MAX_OUTPUT_SIZE:
                    stdout = stdout[:MAX_OUTPUT_SIZE] + "\n... [Output Truncated]"
                
                if len(stderr) > MAX_OUTPUT_SIZE:
                    stderr = stderr[:MAX_OUTPUT_SIZE] + "\n... [Error Truncated]"
                    
            except subprocess.TimeoutExpired:
                process.kill()
                return "", "Execution Timed Out", False, timeout, peak_memory_kb, {}
            monitor_thread.join(timeout=1)
            
            duration = time.perf_counter() - start_time
            success = (process.returncode == 0)
            
            # Capture created files before temp_dir is deleted
            created_files = {}
            try:
                for item in os.listdir(temp_dir):
                    item_path = os.path.join(temp_dir, item)
                    # Skip source file, executables, and directories
                    if os.path.isfile(item_path) and item != filename:
                        # Skip compiled artifacts
                        if item in ['main.exe', 'main.jar', 'main.obj', 'Main.class']:
                            continue
                        try:
                            # Try to read as text
                            with open(item_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read(MAX_OUTPUT_SIZE)
                                if len(content) > MAX_OUTPUT_SIZE:
                                    content = content[:MAX_OUTPUT_SIZE] + "\n... [File Truncated]"
                                created_files[item] = content
                        except:
                            pass  # Skip unreadable files
            except:
                pass  # If we can't list files, just continue
            
            return stdout, stderr, success, round(duration, 3), round(peak_memory_kb, 0), created_files

        except subprocess.TimeoutExpired:
            process.kill()
            return "", "Execution Timed Out", False, timeout, peak_memory_kb, {}
        except Exception as e:
            return "", f"Execution Error: {str(e)}", False, 0, 0, {}

