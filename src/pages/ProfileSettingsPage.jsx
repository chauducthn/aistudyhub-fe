import { useEffect, useMemo, useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isAdminRole } from '../utils/roles'

export default function ProfileSettingsPage() {
  const { user, updateProfile, uploadAvatar, deleteAvatar, changePassword } = useAuth()
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
  const displayedAvatar = avatarPreview || user?.avatarUrl || ''

  return (
    <DashboardShell type={isAdminRole(user?.role) ? 'admin' : 'user'}>
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
              {displayedAvatar ? (
                <img src={displayedAvatar} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#e8e3ff] text-2xl font-extrabold text-[#3427d9]">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-extrabold">Personal Information</h2>
                <p className="mt-1 font-semibold text-slate-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
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

            <form onSubmit={handleAvatarSubmit} className="mt-8 border-t border-slate-100 pt-8">
              {avatarError && <Alert tone="error">{avatarError}</Alert>}
              {avatarMessage && <Alert>{avatarMessage}</Alert>}

              <Field label="Avatar Image" htmlFor="avatar">
                <input
                  id="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#4f5668] file:mr-4 file:rounded-md file:border-0 file:bg-[#e8e3ff] file:px-4 file:py-2 file:font-bold file:text-[#3427d9]"
                />
              </Field>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingAvatar || !avatarFile}
                  className="h-12 rounded-lg bg-[#3b2be0] px-7 font-bold text-white disabled:opacity-60"
                >
                  {savingAvatar ? 'Uploading...' : 'Upload Avatar'}
                </button>
                {user?.avatarUrl && (
                  <button
                    type="button"
                    disabled={deletingAvatar}
                    onClick={handleAvatarDelete}
                    className="h-12 rounded-lg border border-red-200 px-7 font-bold text-red-600 disabled:opacity-60"
                  >
                    {deletingAvatar ? 'Removing...' : 'Remove Avatar'}
                  </button>
                )}
              </div>
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
