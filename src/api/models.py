from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 1. User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    avatars = db.relationship('Avatar', backref='user', lazy=True)

# 2. Avatar Model
class Avatar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(100))
    status = db.Column(db.String(50), default="generated")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customization = db.relationship('Customization', backref='avatar', uselist=False)

# 3. Customization Model
class Customization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    avatar_id = db.Column(db.Integer, db.ForeignKey('avatar.id'), nullable=False)
    skin_color = db.Column(db.String(50))
    outfit_color = db.Column(db.String(50))
    accessories = db.Column(db.Text)  # JSON string or comma-separated values
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SubscriptionPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # e.g., Basic, Pro, Premium
    description = db.Column(db.Text)
    price_monthly = db.Column(db.Float, nullable=False)
    price_yearly = db.Column(db.Float, nullable=True)
    features = db.Column(db.Text)  # Could be a comma-separated string or JSON blob
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MotionCaptureSession(db.Model):
    __tablename__ = 'motion_capture_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    avatar_id = db.Column(db.Integer, db.ForeignKey('avatar.id'))
    source_type = db.Column(db.String(20))  # 'live' or 'video'
    video_filename = db.Column(db.String(255))
    pose_data_url = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='motion_sessions')
    avatar = db.relationship('Avatar', backref='motion_sessions')


class MotionFromVideo(db.Model):
    __tablename__ = 'motion_from_video'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    video_filename = db.Column(db.String(255), nullable=False)
    extracted_frames = db.Column(db.Integer)
    pose_data_url = db.Column(db.String(512))
    rigged_avatar_id = db.Column(db.Integer, db.ForeignKey('rigged_avatar.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='video_motions')
    rigged_avatar = db.relationship('RiggedAvatar', backref='video_sources')


class RiggedAvatar(db.Model):
    __tablename__ = 'rigged_avatar'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    avatar_id = db.Column(db.Integer, db.ForeignKey('avatar.id'), nullable=False)
    rig_type = db.Column(db.String(50))  # mixamo, deepmotion, etc.
    rig_file_url = db.Column(db.String(512))
    bone_map_json = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='rigged_avatars')
    avatar = db.relationship('Avatar', backref='rigs')