from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-debug-key'
DEBUG = False  # OPTIMIZED: Memory saving
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'editor', # Main application handling the IDE logic
]

# COMPILER CONFIGURATION
# ----------------------
# Define paths to your local compilers here if they are not in your system PATH.
# You can override these in `local_settings.py`.
#
# To DISABLE a language:
# Simply remove it or comment it out in `local_settings.py`.
#
# Supported Keys:
# "python", "c", "cpp", "pascal", "javascript", "java", "dart", "pypy", "go", "kotlin", "asm"
#
# Example (in local_settings.py):
# COMPILER_PATHS = {
#     "c": "C:\\MinGW\\bin\\gcc.exe",
#     "cpp": "C:\\MinGW\\bin\\g++.exe",
#     # "python": "python"  <-- This would disable Python
# }

# APP CONFIGURATION
# -----------------
SITE_BRANDING = "Codeon"  # App name displayed in header

# EXECUTION SETTINGS
EXECUTION_TIMEOUT = 5  # Seconds to wait before killing a process

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'webide.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# Logging configuration removed for performance

WSGI_APPLICATION = 'webide.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / "static"]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Local Settings Import
try:
    from .local_settings import *
except ImportError:
    pass

# ABSOLUTE FORCE DEBUG - DISABLED FOR MEMORY OPTIMIZATION
DEBUG = False
ALLOWED_HOSTS = ["*"]
