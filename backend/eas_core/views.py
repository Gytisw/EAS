from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TaskConfig, Schedule
from .serializers import TaskConfigSerializer, ScheduleSerializer

# Create your views here.

class TaskConfigViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to manage their TaskConfigs.
    """
    serializer_class = TaskConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the task configs
        for the currently authenticated user.
        """
        return TaskConfig.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Ensure the user is set to the currently authenticated user.
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Ensure the user is set to the currently authenticated user on update as well,
        although get_queryset should prevent unauthorized access.
        """
        serializer.save(user=self.request.user)


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to manage their Schedules.
    """
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the schedules
        for the currently authenticated user.
        """
        return Schedule.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Ensure the user is set to the currently authenticated user.
        """
        # The user is already set by ScheduleSerializer's HiddenField CurrentUserDefault
        # but explicitly setting it here or in serializer.save() is also fine.
        # We also need to ensure that the task_config selected belongs to the user.
        # The serializer's __init__ method already filters the task_config queryset.
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Ensure the user is set to the currently authenticated user on update as well.
        """
        serializer.save(user=self.request.user)
