import { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

function resolveMediaUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8081/api'
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

export default function ProfileSettingsPage() {
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    setProfileError('')
    setSavingProfile(true)
    try {
      await updateProfile({ fullName, avatarUrl })
      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(getApiErrorMessage(error, 'Could not update profile.'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarMessage('')
    setAvatarError('')
    setUploadingAvatar(true)
    try {
      const updated = await uploadAvatar(file)
      setAvatarUrl(updated.avatarUrl || '')
      setAvatarMessage('Avatar uploaded successfully.')
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, 'Could not upload avatar.'))
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm password does not match.')
      return
    }

    setSavingPassword(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password changed successfully.')
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, 'Could not change password.'))
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = (user?.fullName || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DashboardShell type={user?.role === 'ADMIN' ? 'admin' : 'user'}>
      <div className="px-8 py-10 lg:px-10">
        <div>
          <h1 className="text-4xl font-extrabold">Profile Settings</h1>
          <p className="mt-3 text-lg font-semibold text-[#4f5668]">
            Update your personal information and secure your account.
          </p>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-5">
              {avatarUrl ? (
                <img src={resolveMediaUrl(avatarUrl)} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#e8e3ff] text-2xl font-extrabold text-[#3525cd]">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-extrabold">Personal Information</h2>
                <p className="mt-1 font-semibold text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-[#4f5668]">Upload avatar (image)</label>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingAvatar}
                onChange={handleAvatarUpload}
                className="mt-3 block w-full text-sm"
              />
              {avatarError && <div className="mt-2"><Alert tone="error">{avatarError}</Alert></div>}
              {avatarMessage && <div className="mt-2"><Alert>{avatarMessage}</Alert></div>}
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
              {profileError && <Alert tone="error">{profileError}</Alert>}
              {profileMessage && <Alert>{profileMessage}</Alert>}

              <Field label="Full Name" htmlFor="fullName">
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="auth-input"
                  required
                />
              </Field>

              <Field label="Avatar URL" htmlFor="avatarUrl">
                <input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  className="auth-input"
                  placeholder="https://example.com/avatar.png"
                />
              </Field>

              <button
                type="submit"
                disabled={savingProfile}
                className="h-12 rounded-xl bg-[#3525cd] px-7 font-bold text-white disabled:opacity-60"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold">Change Password</h2>
            <p className="mt-2 font-semibold text-slate-500">
              Confirm your current password before setting a new one.
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
              {passwordError && <Alert tone="error">{passwordError}</Alert>}
              {passwordMessage && <Alert>{passwordMessage}</Alert>}

              <Field label="Current Password" htmlFor="currentPassword">
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="auth-input"
                  required
                />
              </Field>

              <Field label="New Password" htmlFor="newPassword">
                <input
                  id="newPassword"
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="auth-input"
                  required
                />
              </Field>

              <Field label="Confirm New Password" htmlFor="confirmPassword">
                <input
                  id="confirmPassword"
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="auth-input"
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={savingPassword}
                className="h-12 rounded-xl bg-[#3525cd] px-7 font-bold text-white disabled:opacity-60"
              >
                {savingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </article>
        </div>
      </div>
    </DashboardShell>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-bold text-[#4f5668]">
        {label}
      </label>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Alert({ tone = 'success', children }) {
  const classes =
    tone === 'error'
      ? 'bg-red-50 text-red-700'
      : 'bg-green-50 text-green-700'
  return <div className={`rounded-lg px-4 py-3 text-sm font-bold ${classes}`}>{children}</div>
}
