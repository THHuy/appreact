import React, { useState } from 'react';

function Hello() {
  const [name, setName] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Nhập tên của bạn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      />
      {name && <h1>Hello, {name}!</h1>}
    </div>
  );
}

export default Hello;
