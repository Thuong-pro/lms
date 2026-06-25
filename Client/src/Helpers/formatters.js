// Format date to readable format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format short date
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Format time duration
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Format percentage
export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'passed': 'text-green-600 bg-green-100',
    'failed': 'text-red-600 bg-red-100',
    'submitted': 'text-blue-600 bg-blue-100',
    'pending': 'text-yellow-600 bg-yellow-100',
    'active': 'text-green-600',
    'inactive': 'text-gray-600',
  };
  return colors[status] || 'text-gray-600';
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colors = {
    'ADMIN': 'badge-error',
    'TEACHER': 'badge-warning',
    'USER': 'badge-info',
  };
  return colors[role] || 'badge-default';
};

// Convert score to grade
export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};
