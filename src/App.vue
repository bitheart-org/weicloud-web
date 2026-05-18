<template>
  <router-view />
</template>

<style>
:root {
  --app-bg-start: #f3f6ff;
  --app-bg-end: #f8fafc;
}

body {
  margin: 0;
  background: linear-gradient(160deg, var(--app-bg-start) 0%, var(--app-bg-end) 100%);
  color: #0f172a;
}

#app {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
}

.app-sidebar {
  background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.app-sidebar .el-menu {
  border-right: none;
  background: transparent;
}

.app-sidebar .el-menu-item {
  color: #cbd5e1;
  margin: 6px 10px;
  border-radius: 10px;
}

.app-sidebar .el-menu-item.is-active {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 14px 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.app-main {
  padding-top: 14px;
}

.modern-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
</style>
