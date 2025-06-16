export const cssStyles = `
/* AIForm 样式 */
.aiform-button {
  position: fixed;
  z-index: 9999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.aiform-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.aiform-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.aiform-button svg {
  flex-shrink: 0;
}

/* 模态框样式 */
.aiform-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.aiform-modal.active {
  opacity: 1;
  visibility: visible;
}

.aiform-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.aiform-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 95%;
  max-width: 900px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.aiform-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.aiform-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.aiform-close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.aiform-close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.aiform-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 标签样式 */
.aiform-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.aiform-tab {
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.aiform-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.aiform-tab:hover {
  color: #667eea;
  background: #f8fafc;
}

/* 表单数据预览 */
.aiform-form-data h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.aiform-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.aiform-data-controls {
  display: flex;
  gap: 8px;
}

.aiform-data-controls button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.aiform-data-controls button:hover {
  background: #e5e7eb;
}

.aiform-select-all {
  background: #dbeafe !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
}

.aiform-select-none {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #dc2626 !important;
}

/* 表格样式 */
.aiform-data-table-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  max-height: 400px;
  overflow-y: auto;
}

.aiform-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.aiform-data-table th {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 1;
}

.aiform-data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.aiform-data-row:hover {
  background: #f8fafc;
}

.aiform-checkbox-col {
  width: 50px;
  text-align: center;
}

.aiform-field-col {
  width: 150px;
  min-width: 120px;
}

.aiform-type-col {
  width: 100px;
}

.aiform-value-col {
  width: 200px;
  max-width: 200px;
}

.aiform-options-col {
  width: 150px;
  max-width: 150px;
}

.aiform-status-col {
  width: 120px;
}

.aiform-field-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.aiform-field-name {
  font-weight: 500;
  color: #374151;
  word-break: break-all;
  font-size: 13px;
}

.aiform-field-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.aiform-type-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.aiform-current-value {
  word-break: break-all;
  color: #374151;
  max-height: 60px;
  overflow: hidden;
  line-height: 1.4;
}

.aiform-placeholder {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  font-style: italic;
}

.aiform-options {
  word-break: break-all;
  color: #6b7280;
  font-size: 12px;
  max-height: 60px;
  overflow: hidden;
  line-height: 1.3;
}

/* 状态标签 */
.aiform-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  margin-right: 4px;
  margin-bottom: 2px;
}

.aiform-badge-required {
  background: #fef3c7;
  color: #92400e;
}

.aiform-badge-readonly {
  background: #f3f4f6;
  color: #4b5563;
}

.aiform-badge-disabled {
  background: #fee2e2;
  color: #dc2626;
}

.aiform-no-data {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
  text-align: center;
  padding: 40px 20px;
}

.aiform-no-data p {
  margin: 0;
}

/* 配置表单 */
.aiform-config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.aiform-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.aiform-form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.aiform-form-group input,
.aiform-form-group select,
.aiform-form-group textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.aiform-form-group input:focus,
.aiform-form-group select:focus,
.aiform-form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.aiform-form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* 模态框底部 */
.aiform-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.aiform-selected-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.aiform-selected-count span {
  color: #667eea;
  font-weight: 600;
}

.aiform-footer-buttons {
  display: flex;
  gap: 12px;
}

.aiform-button-primary,
.aiform-button-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.aiform-button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.aiform-button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.aiform-button-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.aiform-button-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* 状态消息 */
.aiform-status {
  padding: 12px 24px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.aiform-status-info {
  color: #2563eb;
  background: #eff6ff;
  border-top-color: #bfdbfe;
}

.aiform-status-success {
  color: #059669;
  background: #ecfdf5;
  border-top-color: #a7f3d0;
}

.aiform-status-error {
  color: #dc2626;
  background: #fef2f2;
  border-top-color: #fca5a5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .aiform-modal-content {
    width: 98%;
    max-height: 90vh;
  }
  
  .aiform-modal-header,
  .aiform-modal-body,
  .aiform-modal-footer {
    padding: 16px;
  }
  
  .aiform-button {
    padding: 10px 16px;
    font-size: 12px;
  }
  
  .aiform-tab {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .aiform-data-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .aiform-data-controls {
    justify-content: center;
  }
  
  .aiform-modal-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .aiform-footer-buttons {
    justify-content: stretch;
  }
  
  .aiform-footer-buttons button {
    flex: 1;
  }
  
  /* 表格在移动端的优化 */
  .aiform-data-table {
    font-size: 12px;
  }
  
  .aiform-data-table th,
  .aiform-data-table td {
    padding: 8px 4px;
  }
  
  .aiform-field-col,
  .aiform-value-col,
  .aiform-options-col {
    min-width: 100px;
  }
  
  .aiform-type-col,
  .aiform-status-col {
    min-width: 80px;
  }
}

@media (max-width: 640px) {
  .aiform-data-table-container {
    font-size: 11px;
  }
  
  .aiform-field-name {
    font-size: 12px;
  }
  
  .aiform-current-value {
    font-size: 12px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.aiform-modal.active .aiform-modal-content {
  animation: fadeIn 0.3s ease;
}

/* 滚动条样式 */
.aiform-data-table-container::-webkit-scrollbar,
.aiform-modal-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.aiform-data-table-container::-webkit-scrollbar-track,
.aiform-modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.aiform-data-table-container::-webkit-scrollbar-thumb,
.aiform-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.aiform-data-table-container::-webkit-scrollbar-thumb:hover,
.aiform-modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.aiform-data-table-container::-webkit-scrollbar-corner {
  background: #f1f5f9;
}
`; 