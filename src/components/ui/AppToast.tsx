import { message } from 'antd';

export function showToast(content: string) {
  message.open({
    content,
    duration: 2.8,
    style: {
      marginTop: 'auto',
      fontWeight: 600,
      fontSize: 12,
    },
  });
}
