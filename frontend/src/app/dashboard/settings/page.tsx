'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Lock,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Bell,
  Award,
  Linkedin,
  Palette,
  Sun,
  Moon,
  Monitor,
  Globe,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  Trophy,
  LogOut,
  Trash2,
  Monitor as MonitorIcon,
  Laptop,
  Tablet,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { usersApi, NotificationPreferences, CertificateSettings, AppearanceSettings, ThemePreference, PrivacySettings, UserSession, TwoFactorSetup } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailCourseUpdates: true,
    emailNewCourses: true,
    emailCompletionReminders: true,
    emailCertificates: true,
    emailMarketing: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  // Certificate settings state
  const [certificateSettings, setCertificateSettings] = useState<CertificateSettings>({
    certificateDisplayName: '',
    linkedinAutoShare: false,
  });
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateSaving, setCertificateSaving] = useState(false);
  const [certificateSuccess, setCertificateSuccess] = useState(false);
  const [certificateError, setCertificateError] = useState('');

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'SYSTEM',
    language: 'en',
  });
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [appearanceSuccess, setAppearanceSuccess] = useState(false);
  const [appearanceError, setAppearanceError] = useState('');

  // Privacy & Security settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    twoFactorEnabled: false,
    profileVisibility: 'public',
    showOnLeaderboard: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);
  const [privacyError, setPrivacyError] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // 2FA state
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'certificates' | 'appearance' | 'privacy'>('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setBio((user as any).bio || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user, isAuthenticated, router]);

  // Fetch notification preferences
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      setNotificationsLoading(true);
      try {
        const response = await usersApi.getNotifications();
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  // Fetch certificate settings
  useEffect(() => {
    const fetchCertificateSettings = async () => {
      if (!isAuthenticated) return;
      setCertificateLoading(true);
      try {
        const response = await usersApi.getCertificateSettings();
        setCertificateSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch certificate settings:', error);
      } finally {
        setCertificateLoading(false);
      }
    };
    fetchCertificateSettings();
  }, [isAuthenticated]);

  // Fetch appearance settings
  useEffect(() => {
    const fetchAppearanceSettings = async () => {
      if (!isAuthenticated) return;
      setAppearanceLoading(true);
      try {
        const response = await usersApi.getAppearanceSettings();
        setAppearanceSettings(response.data);
        // Apply theme on load
        applyTheme(response.data.theme);
      } catch (error) {
        console.error('Failed to fetch appearance settings:', error);
      } finally {
        setAppearanceLoading(false);
      }
    };
    fetchAppearanceSettings();
  }, [isAuthenticated]);

  // Fetch privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!isAuthenticated) return;
      setPrivacyLoading(true);
      try {
        const response = await usersApi.getPrivacySettings();
        setPrivacySettings(response.data);
      } catch (error) {
        console.error('Failed to fetch privacy settings:', error);
      } finally {
        setPrivacyLoading(false);
      }
    };
    fetchPrivacySettings();
  }, [isAuthenticated]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthenticated) return;
      setSessionsLoading(true);
      try {
        const response = await usersApi.getSessions();
        setSessions(response.data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, [isAuthenticated]);

  // Apply theme to document
  const applyTheme = (theme: ThemePreference) => {
    const root = document.documentElement;
    if (theme === 'DARK') {
      root.classList.add('dark');
    } else if (theme === 'LIGHT') {
      root.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setProfileError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Image size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setProfileError('');
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    setProfileError('');

    try {
      const response = await usersApi.uploadAvatar(avatarFile);
      setAvatar(response.data.avatar);
      setAvatarPreview(response.data.avatar);
      setAvatarFile(null);
      await fetchUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      // If there's a pending avatar file, upload it first
      if (avatarFile) {
        await handleAvatarUpload();
      }

      await usersApi.updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
      });
      await fetchUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    const newValue = !notifications[key];
    const updatedNotifications = { ...notifications, [key]: newValue };
    setNotifications(updatedNotifications);
    setNotificationsSaving(true);
    setNotificationsError('');
    setNotificationsSuccess(false);

    try {
      await usersApi.updateNotifications({ [key]: newValue });
      setNotificationsSuccess(true);
      setTimeout(() => setNotificationsSuccess(false), 2000);
    } catch (error: any) {
      // Revert on error
      setNotifications({ ...notifications, [key]: !newValue });
      setNotificationsError(error.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleCertificateDisplayNameSave = async () => {
    setCertificateSaving(true);
    setCertificateError('');
    setCertificateSuccess(false);

    try {
      await usersApi.updateCertificateSettings({
        certificateDisplayName: certificateSettings.certificateDisplayName.trim() || undefined,
      });
      setCertificateSuccess(true);
      setTimeout(() => setCertificateSuccess(false), 2000);
    } catch (error: any) {
      setCertificateError(error.response?.data?.message || 'Failed to update certificate settings');
    } finally {
      setCertificateSaving(false);
    }
  };

  const handleLinkedinToggle = async () => {
    const newValue = !certificateSettings.linkedinAutoShare;
    setCertificateSettings({ ...certificateSettings, linkedinAutoShare: newValue });
    setCertificateSaving(true);
    setCertificateError('');
    setCertificateSuccess(false);

    try {
      await usersApi.updateCertificateSettings({ linkedinAutoShare: newValue });
      setCertificateSuccess(true);
      setTimeout(() => setCertificateSuccess(false), 2000);
    } catch (error: any) {
      // Revert on error
      setCertificateSettings({ ...certificateSettings, linkedinAutoShare: !newValue });
      setCertificateError(error.response?.data?.message || 'Failed to update certificate settings');
    } finally {
      setCertificateSaving(false);
    }
  };

  const handleThemeChange = async (theme: ThemePreference) => {
    const previousTheme = appearanceSettings.theme;
    setAppearanceSettings({ ...appearanceSettings, theme });
    applyTheme(theme);
    setAppearanceSaving(true);
    setAppearanceError('');
    setAppearanceSuccess(false);

    try {
      await usersApi.updateAppearanceSettings({ theme });
      setAppearanceSuccess(true);
      setTimeout(() => setAppearanceSuccess(false), 2000);
    } catch (error: any) {
      // Revert on error
      setAppearanceSettings({ ...appearanceSettings, theme: previousTheme });
      applyTheme(previousTheme);
      setAppearanceError(error.response?.data?.message || 'Failed to update theme');
    } finally {
      setAppearanceSaving(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    const previousLanguage = appearanceSettings.language;
    setAppearanceSettings({ ...appearanceSettings, language });
    setAppearanceSaving(true);
    setAppearanceError('');
    setAppearanceSuccess(false);

    try {
      await usersApi.updateAppearanceSettings({ language });
      setAppearanceSuccess(true);
      setTimeout(() => setAppearanceSuccess(false), 2000);
    } catch (error: any) {
      // Revert on error
      setAppearanceSettings({ ...appearanceSettings, language: previousLanguage });
      setAppearanceError(error.response?.data?.message || 'Failed to update language');
    } finally {
      setAppearanceSaving(false);
    }
  };

  // Privacy Settings Handlers
  const handlePrivacyChange = async (key: 'profileVisibility' | 'showOnLeaderboard', value: any) => {
    const previousValue = privacySettings[key];
    setPrivacySettings({ ...privacySettings, [key]: value });
    setPrivacySaving(true);
    setPrivacyError('');
    setPrivacySuccess(false);

    try {
      await usersApi.updatePrivacySettings({ [key]: value });
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 2000);
    } catch (error: any) {
      setPrivacySettings({ ...privacySettings, [key]: previousValue });
      setPrivacyError(error.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setPrivacySaving(false);
    }
  };

  // 2FA Handlers
  const handleGenerate2FA = async () => {
    setTwoFactorLoading(true);
    setPrivacyError('');
    try {
      const response = await usersApi.generate2FA();
      setTwoFactorSetup(response.data);
    } catch (error: any) {
      setPrivacyError(error.response?.data?.message || 'Failed to generate 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setPrivacyError('Please enter a valid 6-digit code');
      return;
    }
    setTwoFactorLoading(true);
    setPrivacyError('');
    try {
      await usersApi.enable2FA(twoFactorCode);
      setPrivacySettings({ ...privacySettings, twoFactorEnabled: true });
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 2000);
    } catch (error: any) {
      setPrivacyError(error.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setPrivacyError('Please enter a valid 6-digit code');
      return;
    }
    setTwoFactorLoading(true);
    setPrivacyError('');
    try {
      await usersApi.disable2FA(twoFactorCode);
      setPrivacySettings({ ...privacySettings, twoFactorEnabled: false });
      setShowDisable2FA(false);
      setTwoFactorCode('');
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 2000);
    } catch (error: any) {
      setPrivacyError(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Session Handlers
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await usersApi.revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error: any) {
      setPrivacyError(error.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await usersApi.revokeAllSessions();
      setSessions(sessions.filter(s => s.isCurrentSession));
    } catch (error: any) {
      setPrivacyError(error.response?.data?.message || 'Failed to revoke sessions');
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
        return <Laptop className="w-5 h-5" />;
      default:
        return <MonitorIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      await usersApi.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and security settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'password'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    Password
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'certificates'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                    Certificates
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'appearance'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Palette className="w-5 h-5" />
                    Appearance
                  </button>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'privacy'
                        ? 'bg-brand text-black font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-brand border-2 border-black flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-3xl font-bold">
                                {name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title="Change photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image
                            </Button>
                            {avatarFile && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 truncate max-w-[150px]">
                                  {avatarFile.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={handleAvatarUpload}
                                  disabled={avatarUploading}
                                >
                                  {avatarUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Upload'
                                  )}
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              JPEG, PNG, GIF or WebP. Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        minLength={2}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {bio.length}/500 characters
                      </p>
                    </div>

                    {/* Success/Error Messages */}
                    {profileSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Profile updated successfully!
                      </div>
                    )}
                    {profileError && (
                      <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        {profileError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={profileLoading}
                      >
                        {profileLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Change Password</h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    {/* Success/Error Messages */}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        Password changed successfully!
                      </div>
                    )}
                    {passwordError && (
                      <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        {passwordError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2">Email Notifications</h2>
                  <p className="text-gray-600 mb-6">
                    Choose which emails you'd like to receive from us.
                  </p>

                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Course Updates */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div>
                          <h3 className="font-medium">Course Updates</h3>
                          <p className="text-sm text-gray-600">
                            Get notified when courses you're enrolled in are updated
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailCourseUpdates')}
                          disabled={notificationsSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            notifications.emailCourseUpdates
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              notifications.emailCourseUpdates
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* New Courses */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div>
                          <h3 className="font-medium">New Courses</h3>
                          <p className="text-sm text-gray-600">
                            Be the first to know when new courses are available
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailNewCourses')}
                          disabled={notificationsSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            notifications.emailNewCourses
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              notifications.emailNewCourses
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Completion Reminders */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div>
                          <h3 className="font-medium">Completion Reminders</h3>
                          <p className="text-sm text-gray-600">
                            Get gentle reminders to complete your enrolled courses
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailCompletionReminders')}
                          disabled={notificationsSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            notifications.emailCompletionReminders
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              notifications.emailCompletionReminders
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Certificate Notifications */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div>
                          <h3 className="font-medium">Certificate Notifications</h3>
                          <p className="text-sm text-gray-600">
                            Receive emails when you earn a new certificate
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailCertificates')}
                          disabled={notificationsSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            notifications.emailCertificates
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              notifications.emailCertificates
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Marketing Emails */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className="text-sm text-gray-600">
                            Receive promotional offers, tips, and news from 4HACKS
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailMarketing')}
                          disabled={notificationsSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            notifications.emailMarketing
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              notifications.emailMarketing
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Success/Error Messages */}
                      {notificationsSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          Notification preferences updated!
                        </div>
                      )}
                      {notificationsError && (
                        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                          <AlertCircle className="w-5 h-5" />
                          {notificationsError}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'certificates' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2">Certificate Settings</h2>
                  <p className="text-gray-600 mb-6">
                    Customize how your certificates appear and are shared.
                  </p>

                  {certificateLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Certificate Display Name */}
                      <div className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-4">
                          <Award className="w-5 h-5 mt-0.5 text-gray-600" />
                          <div className="flex-1">
                            <h3 className="font-medium">Certificate Display Name</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              The name that will appear on your certificates. Leave empty to use your profile name.
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={certificateSettings.certificateDisplayName}
                                onChange={(e) => setCertificateSettings({
                                  ...certificateSettings,
                                  certificateDisplayName: e.target.value,
                                })}
                                placeholder={user?.name || 'Enter display name'}
                                maxLength={100}
                                className="flex-1 px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                              <Button
                                type="button"
                                variant="primary"
                                onClick={handleCertificateDisplayNameSave}
                                disabled={certificateSaving}
                              >
                                {certificateSaving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn Auto-Share */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <Linkedin className="w-5 h-5 mt-0.5 text-[#0A66C2]" />
                          <div>
                            <h3 className="font-medium">LinkedIn Integration</h3>
                            <p className="text-sm text-gray-600">
                              Automatically prompt to share certificates to your LinkedIn profile
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleLinkedinToggle}
                          disabled={certificateSaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            certificateSettings.linkedinAutoShare
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              certificateSettings.linkedinAutoShare
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Success/Error Messages */}
                      {certificateSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          Certificate settings updated!
                        </div>
                      )}
                      {certificateError && (
                        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                          <AlertCircle className="w-5 h-5" />
                          {certificateError}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2">Appearance</h2>
                  <p className="text-gray-600 mb-6">
                    Customize how the app looks and feels.
                  </p>

                  {appearanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <div>
                        <h3 className="font-medium mb-3">Theme</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose your preferred color scheme
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => handleThemeChange('LIGHT')}
                            disabled={appearanceSaving}
                            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                              appearanceSettings.theme === 'LIGHT'
                                ? 'border-black bg-brand'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Sun className="w-6 h-6" />
                            <span className="text-sm font-medium">Light</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleThemeChange('DARK')}
                            disabled={appearanceSaving}
                            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                              appearanceSettings.theme === 'DARK'
                                ? 'border-black bg-brand'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Moon className="w-6 h-6" />
                            <span className="text-sm font-medium">Dark</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleThemeChange('SYSTEM')}
                            disabled={appearanceSaving}
                            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                              appearanceSettings.theme === 'SYSTEM'
                                ? 'border-black bg-brand'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Monitor className="w-6 h-6" />
                            <span className="text-sm font-medium">System</span>
                          </button>
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Language
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose your preferred interface language
                        </p>
                        <select
                          value={appearanceSettings.language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          disabled={appearanceSaving}
                          className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="ar">العربية</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>

                      {/* Success/Error Messages */}
                      {appearanceSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          Appearance settings updated!
                        </div>
                      )}
                      {appearanceError && (
                        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                          <AlertCircle className="w-5 h-5" />
                          {appearanceError}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2">Two-Factor Authentication</h2>
                    <p className="text-gray-600 mb-6">
                      Add an extra layer of security to your account.
                    </p>

                    {privacyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {!privacySettings.twoFactorEnabled && !twoFactorSetup && (
                          <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Shield className="w-5 h-5 mt-0.5 text-gray-600" />
                              <div>
                                <h3 className="font-medium">Enable 2FA</h3>
                                <p className="text-sm text-gray-600">
                                  Use an authenticator app to generate verification codes
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="primary"
                              onClick={handleGenerate2FA}
                              disabled={twoFactorLoading}
                            >
                              {twoFactorLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Set Up'
                              )}
                            </Button>
                          </div>
                        )}

                        {twoFactorSetup && !privacySettings.twoFactorEnabled && (
                          <div className="p-4 border-2 border-black rounded-lg bg-gray-50">
                            <h3 className="font-medium mb-4">Set Up Authenticator App</h3>
                            <div className="space-y-4">
                              <div className="flex flex-col items-center gap-4">
                                <p className="text-sm text-gray-600 text-center">
                                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                                <img
                                  src={twoFactorSetup.qrCode}
                                  alt="2FA QR Code"
                                  className="w-48 h-48 border-2 border-black rounded-lg"
                                />
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
                                  <code className="px-3 py-1 bg-white border border-gray-300 rounded font-mono text-sm">
                                    {twoFactorSetup.secret}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Enter the 6-digit code from your app
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-center font-mono text-lg tracking-widest"
                                  />
                                  <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleEnable2FA}
                                    disabled={twoFactorLoading || twoFactorCode.length !== 6}
                                  >
                                    {twoFactorLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      'Verify'
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setTwoFactorSetup(null);
                                  setTwoFactorCode('');
                                }}
                                className="w-full"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {privacySettings.twoFactorEnabled && !showDisable2FA && (
                          <div className="flex items-center justify-between p-4 border-2 border-green-200 rounded-lg bg-green-50">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                              <div>
                                <h3 className="font-medium text-green-800">2FA is Enabled</h3>
                                <p className="text-sm text-green-600">
                                  Your account is protected with two-factor authentication
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowDisable2FA(true)}
                            >
                              Disable
                            </Button>
                          </div>
                        )}

                        {showDisable2FA && (
                          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                            <h3 className="font-medium text-red-800 mb-4">Disable Two-Factor Authentication</h3>
                            <p className="text-sm text-red-600 mb-4">
                              Enter your authenticator code to disable 2FA. This will make your account less secure.
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-center font-mono text-lg tracking-widest"
                              />
                              <Button
                                type="button"
                                variant="primary"
                                onClick={handleDisable2FA}
                                disabled={twoFactorLoading || twoFactorCode.length !== 6}
                                className="bg-red-500 hover:bg-red-600 border-red-600"
                              >
                                {twoFactorLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Disable'
                                )}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowDisable2FA(false);
                                setTwoFactorCode('');
                              }}
                              className="w-full mt-3"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold">Active Sessions</h2>
                        <p className="text-gray-600">
                          Manage devices where you're logged in.
                        </p>
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRevokeAllSessions}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out All
                        </Button>
                      )}
                    </div>

                    {sessionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No active sessions found.</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                              session.isCurrentSession
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getDeviceIcon(session.deviceType)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">
                                    {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
                                  </h3>
                                  {session.isCurrentSession && (
                                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {session.location || 'Unknown location'} • {session.ipAddress || 'Unknown IP'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Last active: {formatDate(session.lastActiveAt)}
                                </p>
                              </div>
                            </div>
                            {!session.isCurrentSession && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-2">Privacy Settings</h2>
                    <p className="text-gray-600 mb-6">
                      Control who can see your information.
                    </p>

                    <div className="space-y-4">
                      {/* Profile Visibility */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          {privacySettings.profileVisibility === 'public' ? (
                            <Eye className="w-5 h-5 mt-0.5 text-gray-600" />
                          ) : (
                            <EyeOff className="w-5 h-5 mt-0.5 text-gray-600" />
                          )}
                          <div>
                            <h3 className="font-medium">Profile Visibility</h3>
                            <p className="text-sm text-gray-600">
                              {privacySettings.profileVisibility === 'public'
                                ? 'Your profile is visible to everyone'
                                : 'Only you can see your profile'}
                            </p>
                          </div>
                        </div>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          disabled={privacySaving}
                          className="px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      {/* Show on Leaderboard */}
                      <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <Trophy className="w-5 h-5 mt-0.5 text-gray-600" />
                          <div>
                            <h3 className="font-medium">Show on Leaderboard</h3>
                            <p className="text-sm text-gray-600">
                              Display your progress on public leaderboards
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePrivacyChange('showOnLeaderboard', !privacySettings.showOnLeaderboard)}
                          disabled={privacySaving}
                          className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
                            privacySettings.showOnLeaderboard
                              ? 'bg-brand'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              privacySettings.showOnLeaderboard
                                ? 'translate-x-8'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Success/Error Messages */}
                      {privacySuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          Privacy settings updated!
                        </div>
                      )}
                      {privacyError && (
                        <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                          <AlertCircle className="w-5 h-5" />
                          {privacyError}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
