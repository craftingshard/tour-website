import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type AboutItem = {
  id: string;
  title?: string;
  content?: string;
  // Add other fields as needed
};

export function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "about")); // "about" là tên collection của bạn
        
        if (!querySnapshot.empty) {
          // Lấy document đầu tiên từ kết quả
          const doc = querySnapshot.docs[0];
          const data = {
            id: doc.id,
            ...doc.data()
          } as AboutItem;
          setAboutData(data);
        } else {
          // Xử lý trường hợp không tìm thấy dữ liệu
          setError("Không tìm thấy dữ liệu về trang giới thiệu.");
        }
        setLoading(false);
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
        setLoading(false);
        console.error("Error fetching documents: ", err);
      }
    };
    fetchData();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Đã xảy ra lỗi: {error}</div>;
  }

  // Kiểm tra nếu có dữ liệu thì hiển thị, ngược lại hiển thị thông báo
  return (
    <div>
      {aboutData ? (
        <div>
          <h1>{aboutData.title}</h1>
          {/* Sử dụng dangerouslySetInnerHTML để render HTML */}
          <div dangerouslySetInnerHTML={{ __html: aboutData.content || '' }} />
        </div>
      ) : (
        <div>Không có nội dung để hiển thị.</div>
      )}
    </div>
  );
}