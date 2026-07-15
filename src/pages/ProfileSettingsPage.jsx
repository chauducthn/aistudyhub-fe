import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isAdminRole } from '../utils/roles'

function resolveMediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8081/api'
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

export default function ProfileSettingsPage() {
  const { user, updateProfile, uploadAvatar, deleteAvatar, changePassword } = useAuth()
  const location = useLocation()
  const forcePasswordReset = location.state?.forcePasswordReset || user?.passwordResetRequired
  const [avatarFile, setAvatarFile] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [deletingAvatar, setDeletingAvatar] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return ''
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (!avatarPreview) return undefined
    return () => URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('fullName') || '').trim()
    setProfileMessage('')
    setProfileError('')
    setSavingProfile(true)
    try {
      await updateProfile({ fullName })
      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(getApiErrorMessage(error, 'Could not update profile.'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarSubmit = async (event) => {
    event.preventDefault()
    setAvatarMessage('')
    setAvatarError('')

    if (!avatarFile) {
      setAvatarError('Please choose an image file.')
      return
    }

    setSavingAvatar(true)
    try {
      await uploadAvatar(avatarFile)
      setAvatarFile(null)
      setAvatarMessage('Avatar updated successfully.')
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, 'Could not upload avatar.'))
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    setAvatarMessage('')
    setAvatarError('')
    setDeletingAvatar(true)
    try {
      await deleteAvatar()
      setAvatarFile(null)
      setAvatarMessage('Avatar removed successfully.')
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, 'Could not remove avatar.'))
    } finally {
      setDeletingAvatar(false)
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
  const displayedAvatar = avatarPreview || resolveMediaUrl(user?.avatarUrl)

  return (
    <DashboardShell type={isAdminRole(user?.role) ? 'admin' : 'user'}>
      <div className="px-8 py-10 lg:px-10">
        <div>
          <h1 className="text-4xl font-extrabold">Profile Settings</h1>
          <p className="mt-3 text-lg font-semibold text-[#4f5668]">
            Update your personal information and secure your account.
          </p>
        </div>
        {forcePasswordReset && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm font-bold text-amber-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-extrabold">!</span>
            <span>Your password has been reset by an administrator. You must change your password before you can use the application.</span>
          </div>
        )}

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-6 mb-6">
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-[#3427d9]/10" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-[#e8e3ff] text-3xl font-extrabold text-[#3427d9]">
                  {initials}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold">Personal Information</h2>
                <p className="mt-1 font-semibold text-slate-500">{user?.email}</p>
                
                <form onSubmit={handleAvatarSubmit} className="mt-3 flex flex-wrap items-center gap-2.5">
                  <label
                    htmlFor="avatar"
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#e8e3ff] px-4 text-xs font-bold text-[#3427d9] cursor-pointer hover:bg-[#dcd5ff] transition"
                  >
                    Choose Image
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {avatarFile && (
                    <button
                      type="submit"
                      disabled={savingAvatar}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#3b2be0] px-4 text-xs font-bold text-white hover:bg-[#2d1fb0] transition disabled:opacity-60"
                    >
                      {savingAvatar ? 'Uploading...' : 'Save'}
                    </button>
                  )}
                  {user?.avatarUrl && (
                    <button
                      type="button"
                      disabled={deletingAvatar}
                      onClick={handleAvatarDelete}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                    >
                      {deletingAvatar ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </form>
                {avatarFile && (
                  <p className="mt-1.5 text-xs font-semibold text-slate-500">Selected: {avatarFile.name}</p>
                )}
                {(avatarError || avatarMessage) && (
                  <div className="mt-2">
                    {avatarError && <p className="text-xs font-bold text-red-600">{avatarError}</p>}
                    {avatarMessage && <p className="text-xs font-bold text-green-600">{avatarMessage}</p>}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileError && <Alert tone="error">{profileError}</Alert>}
              {profileMessage && <Alert>{profileMessage}</Alert>}

              <Field label="Full Name" htmlFor="fullName">
                <input
                  id="fullName"
                  name="fullName"
                  key={user?.fullName || 'fullName'}
                  defaultValue={user?.fullName || ''}
                  className="auth-input"
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={savingProfile}
                className="h-12 rounded-lg bg-[#3b2be0] px-7 font-bold text-white disabled:opacity-60"
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
                className="h-12 rounded-lg bg-[#3b2be0] px-7 font-bold text-white disabled:opacity-60"
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
