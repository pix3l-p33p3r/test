from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from auth_app.models import Invitation, Friend, HistoryMatch

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'full_name',
            'image_url',
            'uploaded_image',
            'bio',
            'total_game_played',
            'score'
        ]

class UpdatePasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=True)
    pass1 = serializers.CharField(write_only=True, required=True)
    pass2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['old_password', 'pass1', 'pass2']

    def validate_old_password(self, value):
        user = self.instance
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, data):
        if data['pass1'] != data['pass2']:
            raise serializers.ValidationError({
                "pass2": "The two password fields didn't match."
            })
        
        password = data['pass1']

        if len(password) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})

        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})

        if not any(char.islower() for char in password):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})

        if not any(char.isdigit() for char in password) and not any(char in '!@#$%^&*(),.?":{}|<>' for char in password):
            raise serializers.ValidationError({"password": "Password must contain at least one digit or special character."})

        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['pass1'])
        instance.save()
        return instance

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'bio', 'image_url', 'uploaded_image']
        extra_kwargs = {
            'email': {'required': False},
            'username': {'required': False},
        }
        def validate_username(self, value):
            if User.objects.filter(username=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Username already taken.")
            return value
        def validate_email(self, value):
            if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Email already taken.")
            return value

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["full_name", "username", "email", "password"]

    def validate(self, validated_data):
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})

        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        if len(validated_data['password']) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})

        if not any(char.isupper() for char in validated_data['password']):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})

        if not any(char.islower() for char in validated_data['password']):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})

        if not any(char.isdigit() for char in validated_data['password']) and not any(char in '!@#$%^&*(),.?":{}|<>' for char in validated_data['password']):
            raise serializers.ValidationError({"password": "Password must contain at least one digit or special character."})

        return validated_data

    def create(self, validated_data):
        return User.objects.create_user(
            full_name=validated_data['full_name'],
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        User = authenticate(email=email, password=password)
        if not User:
            raise serializers.ValidationError("Invalid email or password")
        return {"user": User}

class ListAllUsersSer(serializers.ModelSerializer):
    img_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'id', 
            'full_name', 
            'username', 
            'email', 
            'score',
            'full_name',
            'img_url',
            'bio',
            'total_game_played',
        ]
    def get_img_url(self, obj):
        try:
            if obj.uploaded_image:
                return obj.uploaded_image.url if hasattr(obj.uploaded_image, 'url') else str(obj.uploaded_image)
            if hasattr(obj, 'image_url') and obj.image_url:
                return obj.image_url
            return None
        except Exception as e:
            print(f"Error in get_img_url: {str(e)}")
            return None

class ListPendingInvitationsSer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    class Meta:
        model = Invitation
        fields = ['sender', 'receiver']

class FriendListSer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = ['friend']

    def get_friend(self, obj):
        user_instance = self.context['user_instance']
        if obj.user1 == user_instance:
            return UserSerializer(obj.user2).data
        else:
            return UserSerializer(obj.user1).data

class HistoryMatchSer(serializers.ModelSerializer):
    winner = UserSerializer()
    loser= UserSerializer()
    class Meta:
        model = HistoryMatch
        fields = ['match_date', 'winner', 'loser', 'winner_score', 'loser_score']