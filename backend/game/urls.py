from django.urls import path
from . import views

app_name= "tasks"

urlpatterns = [
    path('startGame/', views.startGame, name='add'),

]