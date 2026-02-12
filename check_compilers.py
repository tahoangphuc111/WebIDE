import shutil
import subprocess

compilers = {
    "Python": "python",
    "GCC (C)": "gcc",
    "G++ (C++)": "g++",
    "Free Pascal": "fpc"
}

print("--- Checking Compiler Availability on Windows ---")
for name, cmd in compilers.items():
    path = shutil.which(cmd)
    if path:
        print(f"[OK] {name} found at: {path}")
        # Try to get version
        try:
            if "Pascal" in name:
                ver_cmd = [cmd, "-iV"]
            else:
                ver_cmd = [cmd, "--version"]
            
            result = subprocess.run(ver_cmd, capture_output=True, text=True)
            print(f"     Version: {result.stdout.splitlines()[0] if result.stdout else 'Unknown'}")
        except:
            pass
    else:
        print(f"[MISSING] {name} not found in PATH.")

print("\nTip: If a compiler is missing, install it and add it to your System PATH, or edit 'webide/local_settings.py'.")
