import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Snippet
from .utils import execute_code

from django.conf import settings

@ensure_csrf_cookie
def index(request):
    # Get available languages from compiler settings
    compiler_paths = getattr(settings, 'COMPILER_PATHS', {})
    
    # Get snippets from settings or use defaults
    snippets = getattr(settings, 'CODE_SNIPPETS', {})
    
    # Get Branding and Contact Info
    site_branding = getattr(settings, 'SITE_BRANDING', 'Codeon IDE')
    admin_name = getattr(settings, 'ADMIN_NAME', 'tahoangphuc111')
    admin_email = getattr(settings, 'ADMIN_EMAIL', 'tahoangphuc111@gmail.com')
    
    # Format the languages for the dropdown
    formatted_languages = []
    for lang, compiler_path in compiler_paths.items():
        # Exclude internal keys like "java_run"
        if lang == "java_run":
            continue
        # Special display names
        if lang == "cpp":
            display_name = "C++"
        elif lang == "c":
            display_name = "C"
        else:
            display_name = lang.capitalize()
        
        formatted_languages.append({
            'value': lang,
            'display': display_name
        })
    
    # If no compilers configured, default to python for safety
    if not formatted_languages:
        formatted_languages = [{'value': 'python', 'display': 'Python'}]
    
    return render(request, 'editor/index.html', {
        'available_languages': formatted_languages,
        'initial_snippets': json.dumps(snippets),
        'site_branding': site_branding,
        'admin_name': admin_name,
        'admin_email': admin_email
    })



@require_http_methods(["POST"])
def run_code(request):
    """
    Execute code submitted by the user.
    ...
    """
    try:
        data = json.loads(request.body)
        code = data.get('code', '')
        language = data.get('language', 'python')
        input_data = data.get('input', '')

        # Validate language
        compiler_paths = getattr(settings, 'COMPILER_PATHS', {})
        if language not in compiler_paths:
             return JsonResponse({'error': f'Language "{language}" is not supported or disabled.'}, status=400)

        if not code:
            return JsonResponse({'error': 'No code provided'}, status=400)

        stdout, stderr, success, duration, memory, files = execute_code(code, language, input_data)
        
        return JsonResponse({
            'stdout': stdout,
            'stderr': stderr,
            'success': success,
            'duration': duration,
            'memory': memory,
            'files': files
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["POST"])
def save_snippet(request):
    try:
        # Rate limit check (Session based)
        share_count = request.session.get('share_count', 0)
        if share_count >= 3:
            return JsonResponse({'error': 'Share limit reached (Maximum 3 shares per session).'}, status=403)

        data = json.loads(request.body)
        code = data.get('code', '')
        language = data.get('language', 'python')

        if not code:
            return JsonResponse({'error': 'No code provided'}, status=400)

        snippet = Snippet.objects.create(code=code, language=language)
        
        # Increment count
        request.session['share_count'] = share_count + 1
        
        return JsonResponse({'id': str(snippet.id)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_snippet(request, snippet_id):
    snippet = get_object_or_404(Snippet, id=snippet_id)
    # Render the IDE directly with the snippet data
    return render(request, 'editor/index.html', {
        'initial_code': snippet.code,
        'initial_language': snippet.language
    })
