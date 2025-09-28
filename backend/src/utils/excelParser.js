import XLSX from 'xlsx';

export const parseExcelRab = async (filePath) => {
  try {
    // Baca workbook
    const workbook = XLSX.readFile(filePath);
    
    // Ambil sheet pertama
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Konversi ke JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Pastikan format data sesuai
    const formattedData = data.map((row, index) => {
      // Normalisasi nama kolom (case insensitive)
      const normalizeKey = (obj, keyVariations) => {
        for (const key of keyVariations) {
          if (obj[key] !== undefined) return obj[key];
        }
        return null;
      };
      
      return {
        category: normalizeKey(row, ['category', 'Category', 'CATEGORY', 'kategori', 'Kategori']),
        title: normalizeKey(row, ['title', 'Title', 'TITLE', 'judul', 'Judul']),
        itemNo: normalizeKey(row, ['itemNo', 'ItemNo', 'ITEMNO', 'item_no', 'Item_No', 'no_item', 'No_Item']),
        uraian: normalizeKey(row, ['uraian', 'Uraian', 'URAIAN', 'description', 'Description']),
        volume: parseFloat(normalizeKey(row, ['volume', 'Volume', 'VOLUME', 'vol', 'Vol']) || 0),
        satuan: normalizeKey(row, ['satuan', 'Satuan', 'SATUAN', 'unit', 'Unit']),
        bobot: parseFloat(normalizeKey(row, ['bobot', 'Bobot', 'BOBOT', 'weight', 'Weight']) || 0),
        building: normalizeKey(row, ['building', 'Building', 'BUILDING', 'gedung', 'Gedung', 'lokasi', 'Lokasi'])
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Gagal memproses file Excel');
  }
};