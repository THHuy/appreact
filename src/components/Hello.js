import React, { useRef, useState } from 'react';

function Hello() {
  const inputRef = useRef(null);
  const [confirmedName, setConfirmedName] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Nhập tên của bạn"
        style={{ padding: '8px', fontSize: '16px' }}
      />
      <button
        style={{ marginLeft: '10px', padding: '8px', fontSize: '16px' }}
        onClick={() => setConfirmedName(inputRef.current.value)}
      >
        Say Hello
      </button>
      {confirmedName && <h1>Hello, {confirmedName}!</h1>}
    </div>
  );
}

export default Hello;
