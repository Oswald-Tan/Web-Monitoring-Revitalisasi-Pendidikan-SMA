import mockData from "../../data/mockData";
import { File, FilePlus, Download } from 'lucide-react';

const TemplateSOP = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Template & SOP</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukuran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockData.templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="font-medium text-gray-900">{template.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Upload Template Baru</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FilePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Klik untuk upload file atau drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Format: DOCX, XLSX, PDF (maks. 10MB)
          </p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Pilih File
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSOP;