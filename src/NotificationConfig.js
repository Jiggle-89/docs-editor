import { notification } from 'antd';

notification.config({
  duration: 3,
  placement: 'bottomRight',
  rtl: true
});

export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (message, description) => {
    api.success({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  };

  const openError = (message, description) => {
    api.error({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  }

  return { openNotification, openError, contextHolder };
};