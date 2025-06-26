import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { ImageIcon, Eye, Download, Calendar, User, BookOpen } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface GalleryImage {
  id: string;
  src: string;
  nama: string;
  kelas: string;
  mapel: string;
  waktu: string;
}

export const StudentGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await get(ref(database, 'absensi/siswa'));
      const rawData = snapshot.val();
      
      if (!rawData) {
        setError('Tidak ada gambar galeri yang tersedia');
        setLoading(false);
        return;
      }

      const galleryImages: GalleryImage[] = [];

      // Process student data to extract photos
      for (const userId in rawData) {
        const mapelData = rawData[userId];
        for (const mapelKey in mapelData) {
          const waktuData = mapelData[mapelKey];
          for (const waktuKey in waktuData) {
            const entry = waktuData[waktuKey];
            if (entry.foto && entry.foto !== 'Tidak Diketahui') {
              galleryImages.push({
                id: `${userId}-${mapelKey}-${waktuKey}`,
                src: entry.foto,
                nama: entry.nama || 'Siswa Tidak Dikenal',
                kelas: entry.kelas || 'Tidak Diketahui',
                mapel: entry.mapel || 'Tidak Diketahui',
                waktu: entry.waktu
              });
            }
          }
        }
      }

      // Sort by time (newest first)
      galleryImages.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
      
      setImages(galleryImages);

      if (galleryImages.length === 0) {
        setError('Tidak ada foto siswa yang tersedia');
      }

    } catch (error) {
      console.error('Error loading gallery images:', error);
      setError('Gagal memuat galeri foto siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const downloadImage = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `${image.nama}_${image.kelas}_${new Date(image.waktu).toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-effect rounded-2xl p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full mr-3"></div>
          <ImageIcon className="w-5 h-5 mr-2 text-primary-400" />
          Galeri Foto Siswa
        </h3>
        
        <button
          onClick={loadGalleryImages}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-300 border border-primary-500/30 rounded-lg hover:bg-primary-600/30 transition-all duration-200 button-glow"
        >
          <ImageIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat galeri foto siswa..." />
      ) : error ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">{error}</p>
          <button
            onClick={loadGalleryImages}
            className="mt-4 px-4 py-2 bg-primary-600/20 text-primary-300 border border-primary-500/30 rounded-lg hover:bg-primary-600/30 transition-all duration-200"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative bg-dark-800/50 rounded-xl overflow-hidden border border-dark-600 hover:border-primary-500/50 transition-all duration-300 hover-scale animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleImageClick(image)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={`Foto ${image.nama}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                        className="p-2 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h4 className="font-semibold text-white text-sm mb-1 truncate">{image.nama}</h4>
                  <p className="text-xs text-gray-400 mb-1">{image.kelas}</p>
                  <p className="text-xs text-gray-500 truncate">{image.mapel}</p>
                </div>
              </div>
            ))}
          </div>

          {images.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>Total: {images.length} foto • Klik foto untuk melihat detail</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className="bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-dark-600">
              <h3 className="text-lg font-semibold text-white">Detail Foto Siswa</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-4">
                <img
                  src={selectedImage.src}
                  alt={`Foto ${selectedImage.nama}`}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>
              
              <div className="md:w-80 p-4 border-t md:border-t-0 md:border-l border-dark-600">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-400">Nama Siswa</p>
                      <p className="text-white font-medium">{selectedImage.nama}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-400">Kelas & Pelajaran</p>
                      <p className="text-white font-medium">{selectedImage.kelas}</p>
                      <p className="text-sm text-gray-300">{selectedImage.mapel}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm text-gray-400">Waktu</p>
                      <p className="text-white font-medium">
                        {new Date(selectedImage.waktu).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => downloadImage(selectedImage)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors button-glow"
                  >
                    <Download className="w-4 h-4" />
                    Download Foto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};