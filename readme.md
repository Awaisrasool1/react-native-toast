# react-native-toasty-toast

A customizable toast component for React Native, allowing you to display informational messages like success, error, warning, and info. The toast can appear at the top or bottom of the screen, with configurable styles and duration.

## Demo

![Toast Demo](https://github.com/user-attachments/assets/82b73078-ec53-4aeb-8e97-35a25e2b2101)

The demo above shows:
- Multiple toast types in action
- Smooth animations and transitions
- Different positioning options
- Auto-dismiss behavior

## Features

- Multiple toast types (success, error, warning)
- Flexible positioning (top or bottom)
- Smooth animations
- Customizable duration
- Lightweight
- Written in TypeScript
- Easy to integrate
- Fully customizable styles

## Installation

```bash
# Using npm
npm install react-native-toasty-toast

# Using yarn
yarn add react-native-toasty-toast
```

## Usage

### Step 1: Wrap Your App with ToastProvider

First, wrap your root component with the `ToastProvider`:

```jsx
import React from 'react';
import { ToastProvider } from 'react-native-toasty-toast';
import Home from './Home';

const App = () => {
  return (
    <ToastProvider>
      <Home />
    </ToastProvider>
  );
};

export default App;
```

### Step 2: Use the Toast Hook

Use the `useToast` hook in any component to show toast notifications:

```jsx
import React from 'react';
import { Button } from 'react-native';
import { useToast } from 'react-native-toasty-toast';

const Home = () => {
  const { showToast } = useToast();

  const showSuccessToast = () => {
    showToast('Operation successful!', 'success', 'top', 3000);
  };

  const showErrorToast = () => {
    showToast('Something went wrong!', 'error', 'bottom', 3000);
  };

  const showWarningToast = () => {
    showToast('Please check your input!', 'warning', 'top', 3000);
  };

  return (
    <>
      <Button title="Show Success" onPress={showSuccessToast} />
      <Button title="Show Error" onPress={showErrorToast} />
      <Button title="Show Warning" onPress={showWarningToast} />
    </>
  );
};

export default Home;
```

## API Reference

### ToastProvider

The provider component that enables toast functionality throughout your app.

**Props:** None required

### useToast

A hook that returns an object with the `showToast` function.

#### showToast Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|-----------|
| message | string | The text to display in the toast | Yes |
| type | 'success' \| 'error' \| 'warning' | The type of toast to display | Yes |
| position | 'top' \| 'bottom' | Where to display the toast | Yes |
| duration | number | How long to show the toast (in milliseconds) | Yes |

## Examples

### Success Toast
```jsx
showToast('Profile updated successfully!', 'success', 'top', 3000);
```

### Error Toast
```jsx
showToast('Failed to save changes', 'error', 'bottom', 3000);
```

### Warning Toast
```jsx
showToast('Low storage space remaining', 'warning', 'top', 3000);
```
