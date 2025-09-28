import RabItem from '../models/rab_item.js';
import School from '../models/school.js';
import { parseExcelRab } from '../utils/excelParser.js';

export const uploadRab = async (req, res) => {
  try {
    const { schoolId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    console.log('Uploading RAB for school:', schoolId);
    console.log('File received:', req.file);

    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'Sekolah tidak ditemukan' });
    }

    // Parse Excel file
    const rabData = await parseExcelRab(req.file.path);
    console.log('Parsed data:', rabData);
    
    // Hapus RAB lama jika ada
    await RabItem.destroy({ where: { schoolId } });
    
    // Validasi dan simpan data
    const rabItems = [];
    for (const item of rabData) {
      try {
        // Pastikan data yang diperlukan ada
        if (!item.category || !item.itemNo || !item.uraian) {
          console.warn('Item skipped due to missing required fields:', item);
          continue;
        }
        
        const newItem = await RabItem.create({
          schoolId,
          category: item.category,
          title: item.title || '',
          itemNo: item.itemNo,
          uraian: item.uraian,
          volume: item.volume || 0,
          satuan: item.satuan || '',
          bobot: item.bobot || 0,
          building: item.building || ''
        });
        
        rabItems.push(newItem);
      } catch (itemError) {
        console.error('Error creating RAB item:', itemError);
        // Lanjutkan dengan item berikutnya meskipun ada error
      }
    }

    console.log(`Successfully created ${rabItems.length} RAB items`);

    res.status(201).json({
      message: 'RAB berhasil diupload',
      count: rabItems.length,
      data: rabItems
    });
  } catch (error) {
    console.error('Error uploading RAB:', error);
    res.status(500).json({ error: 'Gagal mengupload RAB: ' + error.message });
  }
};

export const getRabBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const rabItems = await RabItem.findAll({
      where: { schoolId },
      order: [
        ['itemNo', 'ASC']
      ]
    });
    
    res.json({
      success: true,
      data: rabItems
    });
  } catch (error) {
    console.error('Error fetching RAB:', error);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil data RAB' 
    });
  }
};

export const deleteRab = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const deletedCount = await RabItem.destroy({
      where: { schoolId }
    });
    
    res.json({
      success: true,
      message: `Berhasil menghapus ${deletedCount} item RAB`
    });
  } catch (error) {
    console.error('Error deleting RAB:', error);
    res.status(500).json({ 
      success: false,
      error: 'Gagal menghapus RAB' 
    });
  }
};