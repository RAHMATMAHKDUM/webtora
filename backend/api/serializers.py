from rest_framework import serializers
from .models import MonitoredSite

class MonitoredSiteSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = MonitoredSite

        fields = "__all__"

        read_only_fields = [
            "user"
        ]# api/serializers.py (tambahkan di akhir)
import re
from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password minimal 8 karakter.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password harus mengandung huruf kapital (A-Z).")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password harus mengandung huruf kecil (a-z).")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password harus mengandung angka (0-9).")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password harus mengandung simbol (!@#$%^&*).")
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Password tidak cocok."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user