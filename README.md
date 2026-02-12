# Local Web IDE

A lightweight, local-first Web IDE built with Django. Supports Python, C, C++, and Pascal.

## Features
- **Multi-language Support**: Run code in Python, C, C++, and Pascal.
- **Secure Execution**: Code runs in a controlled subprocess with timeout and memory limits.
- **Memory Optimized**: Configured for low resource usage on local machines.
- **Local & Fast**: No internet required for compilation (uses local compilers).

## Installation

### Prerequisites
1.  **Python 3.8+** installed.
2.  **Compilers** (optional, but needed for C/C++/Pascal):
    - `gcc` / `g++` (MinGWRecommended for Windows)
    - `fpc` (Free Pascal Compiler) and more!
    - Ensure these are added to your system's PATH.

### Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/tahoangphuc111/WebIDE.git IDE
    cd IDE
    ```
2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the server**:
    ```bash
    python manage.py runserver
    ```
4.  **Access the IDE**:
    Open your browser and go to `http://127.0.0.1:8000/`.

## Configuration
- **Settings**: Check `webide/settings.py` for advanced configuration.
- **Compilers**: The app attempts to find compilers automatically. You can explicitly set paths in `settings.py` if needed.
