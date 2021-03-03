import createMemo from 'memoizee';

const arrayBufferToBase64 = createMemo((buffer: any) => {
  try {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  } catch (e) {
    console.log('_arrayBufferToBase64 err', e);

    return '';
  }
});

export default arrayBufferToBase64;
