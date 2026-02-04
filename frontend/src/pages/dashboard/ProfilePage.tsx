import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface ProfileForm {
  fullName: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordForm>();

  const onUpdateProfile = async (data: ProfileForm) => {
    setLoadingProfile(true);
    try {
      const response = await authApi.updateProfile(data);
      if (response.data.data) {
        updateUser(response.data.data);
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('As senhas nao coincidem');
      return;
    }

    setLoadingPassword(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    } catch (error) {
      toast.error('Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.fullName}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <User size={20} />
            Informacoes Pessoais
          </h3>

          <Input
            label="Nome Completo"
            error={profileForm.formState.errors.fullName?.message}
            {...profileForm.register('fullName', { required: 'Nome e obrigatorio' })}
          />

          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            {...profileForm.register('phone')}
          />

          <Input
            label="Email"
            value={user?.email}
            disabled
            helperText="O email nao pode ser alterado"
          />

          {user?.companyName && (
            <Input
              label="Empresa"
              value={user.companyName}
              disabled
            />
          )}

          <Button type="submit" loading={loadingProfile}>
            <Save size={16} />
            Salvar Alteracoes
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Lock size={20} />
            Alterar Senha
          </h3>

          <Input
            label="Senha Atual"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword', { required: 'Senha atual e obrigatoria' })}
          />

          <Input
            label="Nova Senha"
            type="password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword', {
              required: 'Nova senha e obrigatoria',
              minLength: { value: 8, message: 'Minimo 8 caracteres' },
            })}
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword', { required: 'Confirmacao e obrigatoria' })}
          />

          <Button type="submit" loading={loadingPassword}>
            <Lock size={16} />
            Alterar Senha
          </Button>
        </form>
      </div>
    </div>
  );
}
