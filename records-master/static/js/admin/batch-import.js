// 批量导入工具
(function() {
  'use strict';

  window.BatchImport = {
    // 初始化批量导入模态框
    initBatchImportModal: function(type) {
      // 移除已存在的模态框
      var existingModal = document.getElementById('batchImportModal');
      if (existingModal) existingModal.remove();
      
      var title, columns, placeholder;
      if (type === 'employees') {
        title = '批量导入员工';
        columns = ['员工姓名', '部门名称'];
        placeholder = '支持从Excel粘贴，格式：员工姓名\t部门名称';
      } else if (type === 'ratingItems') {
        title = '批量导入评分项';
        columns = ['评分项名称', '描述'];
        placeholder = '支持从Excel粘贴，格式：评分项名称\t描述';
      }
      
      var modalHtml = 
        '<div id="batchImportModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">' +
          '<div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">' +
            '<div class="p-6 border-b border-neutral-200">' +
              '<div class="flex justify-between items-center">' +
                '<h3 class="font-semibold text-lg">' + title + '</h3>' +
                '<button onclick="this.closest(\'#batchImportModal\').remove()" class="text-neutral-400 hover:text-neutral-700">' +
                  '<i class="fa fa-times"></i>' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<div class="p-6">' +
              '<div class="mb-4 flex gap-2">' +
                '<button onclick="window.BatchImport.addBatchImportRow(\'' + type + '\')" class="btn-secondary text-sm">' +
                  '<i class="fa fa-plus mr-1"></i> 添加行' +
                '</button>' +
                '<button onclick="window.BatchImport.removeSelectedRows()" class="btn-secondary text-sm">' +
                  '<i class="fa fa-trash mr-1"></i> 删除选中' +
                '</button>' +
              '</div>' +
              '<div class="border border-neutral-200 rounded-lg overflow-hidden">' +
                '<table class="w-full" id="batchImportTable">' +
                  '<thead class="bg-neutral-50">' +
                    '<tr>' +
                      '<th class="table-cell w-12 text-center">' +
                        '<input type="checkbox" id="selectAllRows" onchange="window.BatchImport.toggleSelectAllRows()" class="w-4 h-4">' +
                      '</th>' +
                      '<th class="table-cell w-16 text-center">序号</th>' +
                      columns.map(function(col) {
                        return '<th class="table-cell">' + col + '</th>';
                      }).join('') +
                    '</tr>' +
                  '</thead>' +
                  '<tbody id="batchImportTableBody">' +
                  '</tbody>' +
                '</table>' +
              '</div>' +
              '<div class="mt-3 text-xs text-neutral-400">' +
                '<i class="fa fa-lightbulb-o mr-1"></i>' +
                placeholder +
              '</div>' +
            '</div>' +
            '<div class="p-6 border-t border-neutral-200 flex justify-end gap-3">' +
              '<button onclick="this.closest(\'#batchImportModal\').remove()" class="btn-secondary">取消</button>' +
              '<button onclick="window.BatchImport.executeBatchImport(\'' + type + '\')" class="btn-primary">导入</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // 绑定粘贴事件
      var table = document.getElementById('batchImportTable');
      table.addEventListener('paste', function(e) {
        window.BatchImport.handleTablePaste(e, type);
      });
      
      // 添加初始行
      for (var i = 0; i < 5; i++) {
        window.BatchImport.addBatchImportRow(type);
      }
    },
    
    // 添加批量导入行
    addBatchImportRow: function(type, data) {
      var tbody = document.getElementById('batchImportTableBody');
      if (!tbody) return;
      
      var rowCount = tbody.children.length + 1;
      var col1 = data && data.col1 ? data.col1 : '';
      var col2 = data && data.col2 ? data.col2 : '';
      
      var placeholder1, placeholder2;
      if (type === 'employees') {
        placeholder1 = '请输入员工姓名';
        placeholder2 = '请输入部门名称';
      } else if (type === 'ratingItems') {
        placeholder1 = '请输入评分项名称';
        placeholder2 = '请输入描述（可选）';
      }
      
      var rowHtml = '<tr class="border-b border-neutral-200 hover:bg-neutral-50">' +
        '<td class="table-cell text-center">' +
          '<input type="checkbox" class="row-checkbox w-4 h-4">' +
        '</td>' +
        '<td class="table-cell text-center text-neutral-500">' + rowCount + '</td>' +
        '<td class="table-cell">' +
          '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="' + placeholder1 + '" maxlength="100" value="' + this.escapeHtml(col1) + '">' +
        '</td>' +
        '<td class="table-cell">' +
          '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="' + placeholder2 + '" maxlength="200" value="' + this.escapeHtml(col2) + '">' +
        '</td>' +
      '</tr>';
      
      tbody.insertAdjacentHTML('beforeend', rowHtml);
    },
    
    // 删除选中的行
    removeSelectedRows: function() {
      var checkboxes = document.querySelectorAll('#batchImportTableBody .row-checkbox:checked');
      if (checkboxes.length === 0) {
        alert('请先选择要删除的行');
        return;
      }
      
      checkboxes.forEach(function(checkbox) {
        checkbox.closest('tr').remove();
      });
      
      this.updateRowNumbers();
    },
    
    // 全选/取消全选
    toggleSelectAllRows: function() {
      var selectAll = document.getElementById('selectAllRows');
      var checkboxes = document.querySelectorAll('#batchImportTableBody .row-checkbox');
      checkboxes.forEach(function(checkbox) {
        checkbox.checked = selectAll.checked;
      });
    },
    
    // 更新行号
    updateRowNumbers: function() {
      var rows = document.querySelectorAll('#batchImportTableBody tr');
      rows.forEach(function(row, index) {
        var numberCell = row.querySelector('td:nth-child(2)');
        if (numberCell) {
          numberCell.textContent = index + 1;
        }
      });
    },
    
    // 处理表格粘贴事件
    handleTablePaste: function(e, type) {
      e.preventDefault();

      try {
        var pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (!pastedText) return;

        var lines = pastedText.split('\n');
        var startRow = 0;
        var startCol = 0;

        // 获取当前焦点的行和列
        var focusedInput = document.activeElement;
        if (focusedInput && focusedInput.tagName === 'INPUT') {
          var currentRow = focusedInput.closest('tr');
          if (currentRow) {
            var tbody = document.getElementById('batchImportTableBody');
            startRow = Array.from(tbody.children).indexOf(currentRow);

            // 获取当前列的位置
            var inputs = currentRow.querySelectorAll('input[type="text"]');
            for (var i = 0; i < inputs.length; i++) {
              if (inputs[i] === focusedInput) {
                startCol = i;
                break;
              }
            }
          }
        }

        // 解析并填充数据
        var self = this;
        lines.forEach(function(line, lineIndex) {
          line = line.trim();
          if (!line) return;

          // 跳过表头
          if (lineIndex === 0 && (line.indexOf('员工') >= 0 || line.indexOf('评分项') >= 0 || line.indexOf('姓名') >= 0 || line.indexOf('名称') >= 0 || line.toLowerCase().indexOf('name') >= 0)) {
            return;
          }

          var parts;
          if (line.indexOf('\t') >= 0) {
            parts = line.split('\t');
          } else if (line.indexOf(',') >= 0) {
            parts = line.split(',');
          } else {
            parts = [line];
          }

          parts = parts.map(function(p) { return p.trim(); });

          if (parts.length > 0) {
            var currentRowIndex = startRow + lineIndex;
            var tbody = document.getElementById('batchImportTableBody');

            // 如果行不存在，创建新行
            while (tbody.children.length <= currentRowIndex) {
              self.addBatchImportRow(type);
            }

            // 获取当前行
            var currentRow = tbody.children[currentRowIndex];
            if (currentRow) {
              var inputs = currentRow.querySelectorAll('input[type="text"]');

              // 根据起始列位置填充数据
              parts.forEach(function(part, partIndex) {
                var targetCol = startCol + partIndex;
                if (targetCol < inputs.length) {
                  inputs[targetCol].value = part;
                }
              });
            }
          }
        });

      } catch (error) {
        console.error('粘贴处理出错:', error);
        alert('粘贴数据时出错: ' + error.message);
      }
    },
    
    // 执行批量导入
    executeBatchImport: function(type) {
      var tbody = document.getElementById('batchImportTableBody');
      if (!tbody) return;
      
      var rows = tbody.querySelectorAll('tr');
      var items = [];
      var hasData = false;
      
      rows.forEach(function(row, index) {
        var inputs = row.querySelectorAll('input[type="text"]');
        if (inputs.length >= 2) {
          var col1 = inputs[0].value.trim();
          var col2 = inputs[1].value.trim();
          
          if (col1) {
            items.push({
              col1: col1,
              col2: col2
            });
            hasData = true;
          }
        }
      });
      
      if (!hasData) {
        alert('请至少输入一条数据');
        return;
      }
      
      var typeText = type === 'employees' ? '员工' : '评分项';
      if (!confirm('确定要导入 ' + items.length + ' 个' + typeText + '吗？')) {
        return;
      }
      
      // 将数据转换为文本格式发送给后端
      var textData = items.map(function(item) {
        return item.col1 + '\t' + item.col2;
      }).join('\n');
      
      var promise;
      if (type === 'employees') {
        promise = AdminApi.batchImportEmployees(textData);
      } else if (type === 'ratingItems') {
        promise = AdminApi.batchImportRatingItems(textData);
      }
      
      promise.then(function (res) {
        if (res.success) {
          var msg = res.message;
          if (res.data && res.data.failed_count > 0) {
            msg += '\n\n失败详情：\n';
            res.data.failed_list.forEach(function(item) {
              msg += '第' + item.row + '行: ' + item.name + ' - ' + item.error + '\n';
            });
          }
          alert(msg);
          var modal = document.getElementById('batchImportModal');
          if (modal) modal.remove();
          if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
            window.AdminEvents.loadDataAndRefresh();
          }
        } else {
          var errorMsg = res.error || '导入失败';
          if (res.data && res.data.failed_list) {
            errorMsg += '\n\n失败详情：\n';
            res.data.failed_list.forEach(function(item) {
              errorMsg += '第' + item.row + '行: ' + item.name + ' - ' + item.error + '\n';
            });
          }
          alert(errorMsg);
        }
      }).catch(function (err) {
        alert('导入失败: ' + err.message);
      });
    },
    
    // HTML转义
    escapeHtml: function(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };
})();
