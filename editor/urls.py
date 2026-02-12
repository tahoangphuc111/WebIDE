from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('run/', views.run_code, name='run_code'),
    path('share/', views.save_snippet, name='save_snippet'),
    path('share/<uuid:snippet_id>/', views.get_snippet, name='get_snippet'),
]
