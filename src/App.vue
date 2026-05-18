<template>
  <router-view />
</template>

<style>
:root {
  --app-bg: #f6f7f9;
  --panel-bg: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --brand-primary: #0e8420;
  --brand-primary-soft: rgba(14, 132, 32, 0.12);
}

body {
  margin: 0;
  font-family:
    "Inter",
    "SF Pro Text",
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  background: var(--app-bg);
  color: var(--text-primary);
}

#app {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  background: var(--app-bg);
}

.app-sidebar {
  background: var(--panel-bg);
  border-right: 1px solid var(--border-color);
}

.sidebar-brand {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
}

.sidebar-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--brand-primary);
}

.sidebar-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-menu {
  padding: 10px 8px;
}

.app-sidebar .el-menu {
  border-right: none;
  background: var(--panel-bg);
}

.app-sidebar .el-menu-item {
  color: #374151;
  margin: 2px 0;
  border-radius: 8px;
  height: 38px;
  line-height: 38px;
  font-weight: 500;
}

.app-sidebar .el-menu-item.is-active {
  background: var(--brand-primary-soft);
  color: #0b5f17;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 12px 0;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--panel-bg);
}

.app-main {
  padding: 12px;
}

.header-title {
  font-size: 17px;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: var(--text-secondary);
}

.page-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

.page-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.metric-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.metric-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.modern-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: none;
}

.modern-card :where(.el-card__header) {
  border-bottom: 1px solid var(--border-color);
}

.modern-table :where(.el-table th.el-table__cell) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
}

.modern-table :where(.el-table td.el-table__cell) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.el-button--primary {
  --el-button-bg-color: var(--brand-primary);
  --el-button-border-color: var(--brand-primary);
  --el-button-hover-bg-color: #0a6a19;
  --el-button-hover-border-color: #0a6a19;
}

.el-input__wrapper,
.el-textarea__inner,
.el-select__wrapper {
  border-radius: 8px;
}

.el-dialog {
  border-radius: 12px;
}

@media (max-width: 1100px) {
  .app-sidebar {
    width: 190px !important;
  }
  .metric-value {
    font-size: 22px;
  }
  .page-title {
    font-size: 20px;
  }
}
</style>
