import React from "react";

const Button = ({ message }) => {

  const showAlert = () => {
    alert(message);
  };

  return (
    <button onClick={showAlert}>
      Click Me
    </button>
  );
};

export default Button;