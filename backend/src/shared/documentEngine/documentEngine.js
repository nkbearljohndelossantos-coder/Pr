class SharedDocumentEngine {
  generateDocumentNumber(typeCode, compCode, branchCode, deptCode, seqNumber, date = new Date()) {
    const type = (typeCode || 'DOC').toUpperCase().trim();
    const comp = (compCode || 'EGI').toUpperCase().trim();
    const branch = (branchCode || 'HQ').toUpperCase().trim();
    const dept = (deptCode || 'GEN').toUpperCase().trim();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const seqStr = String(seqNumber).padStart(5, '0');

    return `${type}-${comp}-${dept}-${year}${month}${day}-${seqStr}`;
  }

  createDocumentHeader(payload) {
    return {
      document_number: payload.document_number,
      document_type: payload.document_type || 'REQUISITION',
      company_id: payload.company_id,
      branch_id: payload.branch_id,
      department_id: payload.department_id,
      prepared_by: payload.prepared_by,
      title: payload.title,
      status: payload.status || 'Draft',
      total_amount: payload.total_amount || 0.00,
      created_at: new Date().toISOString()
    };
  }
}

const documentEngine = new SharedDocumentEngine();
module.exports = documentEngine;
