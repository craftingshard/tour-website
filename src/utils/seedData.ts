import { db } from '../firebase'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'

// Sample tour data
const sampleTours = [
  {
    name: "Hạ Long Bay - Vịnh Diệu Kỳ",
    description: "Khám phá vẻ đẹp huyền bí của Vịnh Hạ Long với hàng nghìn hòn đảo đá vôi và hang động kỳ vĩ. Trải nghiệm du thuyền sang trọng và thưởng thức hải sản tươi ngon.",
    price: 2500000,
    duration: "3 ngày 2 đêm",
    location: "Quảng Ninh, Việt Nam",
    rating: 4.8,
    imageUrl: "https://picsum.photos/400/650?random=1",
    category: "Biển",
    highlights: ["Kayak", "Thăm hang động", "Ăn hải sản", "Ngắm hoàng hôn"],
    included: ["Vé máy bay", "Khách sạn 4 sao", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 15,
    difficulty: "Dễ",
    bestTime: "Tháng 3-5, 9-11"
  },
  {
    name: "Sapa - Núi Rừng Tây Bắc",
    description: "Chinh phục đỉnh Fansipan và khám phá văn hóa độc đáo của các dân tộc thiểu số. Trải nghiệm trekking qua những cánh đồng lúa bậc thang tuyệt đẹp.",
    price: 1800000,
    duration: "4 ngày 3 đêm",
    location: "Lào Cai, Việt Nam",
    rating: 4.7,
    imageUrl: "https://picsum.photos/400/650?random=2",
    category: "Núi",
    highlights: ["Leo Fansipan", "Trekking", "Homestay", "Chợ phiên"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Vé cáp treo", "Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    difficulty: "Trung bình",
    bestTime: "Tháng 9-11, 3-5"
  },
  {
    name: "Phú Quốc - Đảo Ngọc",
    description: "Thư giãn tại những bãi biển đẹp nhất Việt Nam với cát trắng mịn và nước biển trong xanh. Khám phá ẩm thực địa phương và các hoạt động giải trí.",
    price: 3200000,
    duration: "5 ngày 4 đêm",
    location: "Kiên Giang, Việt Nam",
    rating: 4.9,
    imageUrl: "https://picsum.photos/400/650?random=3",
    category: "Biển",
    highlights: ["Lặn biển", "Đi thuyền", "Ăn hải sản", "Massage"],
    included: ["Vé máy bay", "Resort 5 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 20,
    difficulty: "Dễ",
    bestTime: "Tháng 11-4"
  },
  {
    name: "Mai Châu - Thung Lũng Xanh",
    description: "Khám phá vẻ đẹp bình yên của thung lũng Mai Châu với những cánh đồng lúa xanh mướt và văn hóa Thái độc đáo. Trải nghiệm cuộc sống dân dã.",
    price: 1200000,
    duration: "2 ngày 1 đêm",
    location: "Hòa Bình, Việt Nam",
    rating: 4.5,
    imageUrl: "https://picsum.photos/400/650?random=4",
    category: "Nông thôn",
    highlights: ["Đạp xe", "Homestay", "Ăn cơm lam", "Múa xòe"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Thuê xe đạp"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 10,
    difficulty: "Dễ",
    bestTime: "Tháng 5-9"
  },
  {
    name: "Nha Trang - Biển Xanh Cát Trắng",
    description: "Tận hưởng kỳ nghỉ tại thành phố biển xinh đẹp với những bãi biển dài và các đảo đẹp. Khám phá văn hóa Chăm và ẩm thực địa phương.",
    price: 2800000,
    duration: "4 ngày 3 đêm",
    location: "Khánh Hòa, Việt Nam",
    rating: 4.6,
    imageUrl: "https://picsum.photos/400/650?random=5",
    category: "Biển",
    highlights: ["Lặn biển", "Thăm đảo", "Ăn hải sản", "Tháp Bà"],
    included: ["Vé máy bay", "Khách sạn 4 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 18,
    difficulty: "Dễ",
    bestTime: "Tháng 1-8"
  },
  {
    name: "Đà Lạt - Thành Phố Ngàn Hoa",
    description: "Khám phá thành phố mộng mơ với khí hậu mát mẻ quanh năm. Thăm các vườn hoa, đồi chè và thưởng thức ẩm thực địa phương độc đáo.",
    price: 2000000,
    duration: "3 ngày 2 đêm",
    location: "Lâm Đồng, Việt Nam",
    rating: 4.7,
    imageUrl: "https://picsum.photos/400/650?random=6",
    category: "Núi",
    highlights: ["Vườn hoa", "Đồi chè", "Ăn bánh", "Hồ Xuân Hương"],
    included: ["Vé xe", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 15,
    difficulty: "Dễ",
    bestTime: "Quanh năm"
  },
  {
    name: "Huế - Cố Đô Lịch Sử",
    description: "Khám phá di sản văn hóa thế giới với các cung điện, lăng tẩm và chùa chiền cổ kính. Tìm hiểu lịch sử triều Nguyễn và thưởng thức ẩm thực cung đình.",
    price: 1600000,
    duration: "3 ngày 2 đêm",
    location: "Thừa Thiên Huế, Việt Nam",
    rating: 4.6,
    imageUrl: "https://picsum.photos/400/650?random=7",
    category: "Văn hóa",
    highlights: ["Đại Nội", "Lăng Khải Định", "Chùa Thiên Mụ", "Ăn bún bò"],
    included: ["Vé xe", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    difficulty: "Dễ",
    bestTime: "Tháng 1-3, 9-12"
  },
  {
    name: "Hội An - Phố Cổ Ánh Đèn",
    description: "Trải nghiệm vẻ đẹp cổ kính của phố cổ Hội An với những ngôi nhà gỗ truyền thống và đèn lồng rực rỡ. Thưởng thức ẩm thực địa phương nổi tiếng.",
    price: 2200000,
    duration: "3 ngày 2 đêm",
    location: "Quảng Nam, Việt Nam",
    rating: 4.8,
    imageUrl: "https://picsum.photos/400/650?random=8",
    category: "Văn hóa",
    highlights: ["Phố cổ", "Làm đèn lồng", "Ăn cao lầu", "Đi thuyền"],
    included: ["Vé xe", "Khách sạn 4 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 15,
    difficulty: "Dễ",
    bestTime: "Tháng 2-4, 8-10"
  },
  {
    name: "Mekong Delta - Chợ Nổi Cửu Long",
    description: "Khám phá vùng sông nước miền Tây với chợ nổi Cái Răng và các làng nghề truyền thống. Trải nghiệm cuộc sống sông nước và ẩm thực địa phương.",
    price: 1400000,
    duration: "2 ngày 1 đêm",
    location: "Cần Thơ, Việt Nam",
    rating: 4.4,
    imageUrl: "https://picsum.photos/400/650?random=9",
    category: "Sông nước",
    highlights: ["Chợ nổi", "Làng nghề", "Ăn bánh tét", "Đi thuyền"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Thuê thuyền"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    difficulty: "Dễ",
    bestTime: "Tháng 6-10"
  },
  {
    name: "Ba Bể - Hồ Nước Ngọt",
    description: "Khám phá hồ nước ngọt lớn nhất Việt Nam với cảnh quan thiên nhiên hoang dã. Trekking qua rừng nguyên sinh và khám phá hang động.",
    price: 1800000,
    duration: "3 ngày 2 đêm",
    location: "Bắc Kạn, Việt Nam",
    rating: 4.5,
    imageUrl: "https://picsum.photos/400/650?random=10",
    category: "Hồ",
    highlights: ["Đi thuyền", "Trekking", "Thăm hang", "Ăn cá hồ"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Thuê thuyền"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 10,
    difficulty: "Trung bình",
    bestTime: "Tháng 3-5, 9-11"
  },
  {
    name: "Côn Đảo - Đảo Tù Lịch Sử",
    description: "Khám phá lịch sử bi thương của nhà tù Côn Đảo và vẻ đẹp hoang dã của đảo. Tắm biển và khám phá rừng ngập mặn.",
    price: 3500000,
    duration: "4 ngày 3 đêm",
    location: "Bà Rịa - Vũng Tàu, Việt Nam",
    rating: 4.7,
    imageUrl: "https://picsum.photos/400/650?random=11",
    category: "Biển",
    highlights: ["Nhà tù", "Bãi biển", "Rừng ngập mặn", "Ăn hải sản"],
    included: ["Vé máy bay", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 15,
    difficulty: "Trung bình",
    bestTime: "Tháng 11-4"
  },
  {
    name: "Y Tý - Nóc Nhà Tây Bắc",
    description: "Chinh phục đỉnh Lảo Thẩn và khám phá văn hóa H'Mông độc đáo. Ngắm mây và hoàng hôn từ độ cao 3000m.",
    price: 2200000,
    duration: "3 ngày 2 đêm",
    location: "Lào Cai, Việt Nam",
    rating: 4.6,
    imageUrl: "https://picsum.photos/400/650?random=12",
    category: "Núi",
    highlights: ["Leo núi", "Ngắm mây", "Homestay", "Ăn thịt trâu"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 8,
    difficulty: "Khó",
    bestTime: "Tháng 9-11, 3-5"
  },
  {
    name: "Phong Nha - Hang Động Kỳ Vĩ",
    description: "Khám phá hệ thống hang động lớn nhất thế giới với Sơn Đoòng và Phong Nha. Trải nghiệm mạo hiểm và khám phá thiên nhiên.",
    price: 2800000,
    duration: "4 ngày 3 đêm",
    location: "Quảng Bình, Việt Nam",
    rating: 4.8,
    imageUrl: "https://picsum.photos/400/650?random=13",
    category: "Hang động",
    highlights: ["Hang Sơn Đoòng", "Hang Phong Nha", "Trekking", "Đi thuyền"],
    included: ["Vé xe", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Thuê thiết bị"],
    maxGroupSize: 12,
    difficulty: "Khó",
    bestTime: "Tháng 2-8"
  },
  {
    name: "Mũi Né - Biển Cát Đỏ",
    description: "Khám phá vẻ đẹp độc đáo của biển cát đỏ và những đồi cát trải dài. Thưởng thức hải sản tươi ngon và các môn thể thao biển.",
    price: 2400000,
    duration: "3 ngày 2 đêm",
    location: "Bình Thuận, Việt Nam",
    rating: 4.5,
    imageUrl: "https://picsum.photos/400/650?random=14",
    category: "Biển",
    highlights: ["Đồi cát", "Lướt ván", "Ăn hải sản", "Ngắm hoàng hôn"],
    included: ["Vé xe", "Khách sạn 4 sao", "Ăn uống", "Thuê thiết bị"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 18,
    difficulty: "Dễ",
    bestTime: "Tháng 11-4"
  },
  {
    name: "Bạch Mã - Vườn Quốc Gia",
    description: "Khám phá vườn quốc gia Bạch Mã với hệ sinh thái đa dạng và cảnh quan thiên nhiên hoang dã. Trekking và ngắm toàn cảnh từ đỉnh núi.",
    price: 1600000,
    duration: "2 ngày 1 đêm",
    location: "Thừa Thiên Huế, Việt Nam",
    rating: 4.4,
    imageUrl: "https://picsum.photos/400/650?random=15",
    category: "Rừng",
    highlights: ["Trekking", "Ngắm cảnh", "Thăm thác", "Ăn cơm lam"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 10,
    difficulty: "Trung bình",
    bestTime: "Tháng 3-5, 9-11"
  },
  {
    name: "Cát Bà - Đảo Khỉ",
    description: "Khám phá đảo Cát Bà với vườn quốc gia và những bãi biển hoang sơ. Khám phá hang động và thưởng thức hải sản tươi ngon.",
    price: 2000000,
    duration: "3 ngày 2 đêm",
    location: "Hải Phòng, Việt Nam",
    rating: 4.6,
    imageUrl: "https://picsum.photos/400/650?random=16",
    category: "Biển",
    highlights: ["Vườn quốc gia", "Bãi biển", "Thăm hang", "Ăn hải sản"],
    included: ["Vé xe", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 15,
    difficulty: "Dễ",
    bestTime: "Tháng 4-10"
  },
  {
    name: "Tam Đảo - Núi Mây",
    description: "Thư giãn tại khu nghỉ dưỡng Tam Đảo với khí hậu mát mẻ quanh năm. Ngắm cảnh và thưởng thức ẩm thực địa phương.",
    price: 1400000,
    duration: "2 ngày 1 đêm",
    location: "Vĩnh Phúc, Việt Nam",
    rating: 4.3,
    imageUrl: "https://picsum.photos/400/650?random=17",
    category: "Núi",
    highlights: ["Ngắm cảnh", "Ăn gà", "Thăm chùa", "Đi bộ"],
    included: ["Vé xe", "Khách sạn 3 sao", "Ăn uống", "Vé tham quan"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    difficulty: "Dễ",
    bestTime: "Quanh năm"
  },
  {
    name: "Bà Nà Hills - Núi Chúa",
    description: "Khám phá khu du lịch Bà Nà Hills với cáp treo dài nhất thế giới và các công trình kiến trúc độc đáo. Thưởng thức khí hậu mát mẻ.",
    price: 1800000,
    duration: "2 ngày 1 đêm",
    location: "Đà Nẵng, Việt Nam",
    rating: 4.7,
    imageUrl: "https://picsum.photos/400/650?random=18",
    category: "Núi",
    highlights: ["Cáp treo", "Chùa Linh Ứng", "Vườn hoa", "Ăn bánh"],
    included: ["Vé xe", "Khách sạn 4 sao", "Ăn uống", "Vé cáp treo"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 20,
    difficulty: "Dễ",
    bestTime: "Quanh năm"
  },
  {
    name: "Cù Lao Chàm - Đảo Xanh",
    description: "Khám phá đảo Cù Lao Chàm với những bãi biển hoang sơ và hệ sinh thái biển phong phú. Lặn biển và thưởng thức hải sản.",
    price: 1600000,
    duration: "2 ngày 1 đêm",
    location: "Quảng Nam, Việt Nam",
    rating: 4.5,
    imageUrl: "https://picsum.photos/400/650?random=19",
    category: "Biển",
    highlights: ["Lặn biển", "Bãi biển", "Ăn hải sản", "Đi thuyền"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Thuê thiết bị"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    difficulty: "Trung bình",
    bestTime: "Tháng 3-8"
  },
  {
    name: "Pù Luông - Ruộng Bậc Thang",
    description: "Khám phá vẻ đẹp hoang dã của Pù Luông với những ruộng bậc thang và rừng nguyên sinh. Trekking và homestay với người dân địa phương.",
    price: 1400000,
    duration: "3 ngày 2 đêm",
    location: "Thanh Hóa, Việt Nam",
    rating: 4.4,
    imageUrl: "https://picsum.photos/400/650?random=20",
    category: "Nông thôn",
    highlights: ["Ruộng bậc thang", "Trekking", "Homestay", "Ăn cơm lam"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 10,
    difficulty: "Trung bình",
    bestTime: "Tháng 5-9"
  }
]

// Sample posts data
const samplePosts = [
  {
    title: "10 Điểm Du Lịch Không Thể Bỏ Qua Ở Việt Nam",
    content: "Việt Nam là một đất nước xinh đẹp với vô số điểm du lịch hấp dẫn. Từ những bãi biển tuyệt đẹp ở miền Nam đến những ngọn núi hùng vĩ ở miền Bắc, mỗi nơi đều mang đến những trải nghiệm độc đáo...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Việt Nam", "Du lịch", "Khám phá"],
    imageUrl: "https://picsum.photos/400/650?random=21",
    publishedAt: new Date(),
    readTime: "5 phút",
    views: 1250,
    likes: 89
  },
  {
    title: "Hướng Dẫn Du Lịch Sapa Mùa Thu",
    content: "Sapa vào mùa thu là một trong những thời điểm đẹp nhất để khám phá vùng đất Tây Bắc. Không khí mát mẻ, cảnh sắc thiên nhiên thay đổi theo mùa tạo nên một bức tranh tuyệt đẹp...",
    author: "Admin",
    category: "Hướng dẫn",
    tags: ["Sapa", "Mùa thu", "Tây Bắc"],
    imageUrl: "https://picsum.photos/400/650?random=22",
    publishedAt: new Date(),
    readTime: "7 phút",
    views: 980,
    likes: 67
  },
  {
    title: "Ẩm Thực Đường Phố Hà Nội",
    content: "Hà Nội không chỉ nổi tiếng với những di tích lịch sử mà còn là thiên đường ẩm thực đường phố. Từ phở, bún chả đến bánh cuốn, mỗi món ăn đều mang hương vị đặc trưng...",
    author: "Admin",
    category: "Ẩm thực",
    tags: ["Hà Nội", "Ẩm thực", "Đường phố"],
    imageUrl: "https://picsum.photos/400/650?random=23",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 1560,
    likes: 112
  },
  {
    title: "Khám Phá Vịnh Hạ Long Bằng Du Thuyền",
    content: "Vịnh Hạ Long là một trong những kỳ quan thiên nhiên thế giới. Cách tốt nhất để khám phá vẻ đẹp của vịnh là bằng du thuyền sang trọng, cho phép bạn tận hưởng trọn vẹn...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Hạ Long", "Du thuyền", "Biển"],
    imageUrl: "https://picsum.photos/400/650?random=24",
    publishedAt: new Date(),
    readTime: "8 phút",
    views: 890,
    likes: 78
  },
  {
    title: "Trekking Đỉnh Fansipan - Hành Trình Chinh Phục",
    content: "Đỉnh Fansipan với độ cao 3.143m là đỉnh núi cao nhất Đông Dương. Hành trình chinh phục đỉnh núi này không chỉ là thử thách thể chất mà còn là trải nghiệm tinh thần...",
    author: "Admin",
    category: "Mạo hiểm",
    tags: ["Fansipan", "Trekking", "Leo núi"],
    imageUrl: "https://picsum.photos/400/650?random=25",
    publishedAt: new Date(),
    readTime: "10 phút",
    views: 720,
    likes: 56
  },
  {
    title: "Phố Cổ Hội An - Di Sản Văn Hóa Thế Giới",
    content: "Hội An là một trong những thành phố cổ đẹp nhất Việt Nam, được UNESCO công nhận là Di sản Văn hóa Thế giới. Với kiến trúc cổ kính và văn hóa truyền thống...",
    author: "Admin",
    category: "Văn hóa",
    tags: ["Hội An", "Phố cổ", "UNESCO"],
    imageUrl: "https://picsum.photos/400/650?random=26",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 1340,
    likes: 95
  },
  {
    title: "Biển Phú Quốc - Thiên Đường Nhiệt Đới",
    content: "Phú Quốc được mệnh danh là 'Đảo Ngọc' với những bãi biển đẹp nhất Việt Nam. Cát trắng mịn, nước biển trong xanh và khí hậu nhiệt đới lý tưởng...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Phú Quốc", "Biển", "Đảo"],
    imageUrl: "https://picsum.photos/400/650?random=27",
    publishedAt: new Date(),
    readTime: "7 phút",
    views: 1100,
    likes: 82
  },
  {
    title: "Mai Châu - Thung Lũng Xanh Tây Bắc",
    content: "Mai Châu là một thung lũng xanh mướt nằm giữa núi rừng Tây Bắc. Nơi đây nổi tiếng với những cánh đồng lúa bậc thang và văn hóa dân tộc Thái độc đáo...",
    author: "Admin",
    category: "Văn hóa",
    tags: ["Mai Châu", "Thung lũng", "Tây Bắc"],
    imageUrl: "https://picsum.photos/400/650?random=28",
    publishedAt: new Date(),
    readTime: "5 phút",
    views: 680,
    likes: 45
  },
  {
    title: "Hang Sơn Đoòng - Kỳ Quan Thiên Nhiên",
    content: "Hang Sơn Đoòng là hang động lớn nhất thế giới, được phát hiện vào năm 1991. Với kích thước khổng lồ và hệ sinh thái độc đáo, hang động này...",
    author: "Admin",
    category: "Thiên nhiên",
    tags: ["Sơn Đoòng", "Hang động", "Quảng Bình"],
    imageUrl: "https://picsum.photos/400/650?random=29",
    publishedAt: new Date(),
    readTime: "9 phút",
    views: 560,
    likes: 38
  },
  {
    title: "Đà Lạt - Thành Phố Ngàn Hoa",
    content: "Đà Lạt được mệnh danh là 'Thành phố ngàn hoa' với khí hậu mát mẻ quanh năm. Nơi đây nổi tiếng với những vườn hoa đẹp, đồi chè xanh mướt...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Đà Lạt", "Hoa", "Núi"],
    imageUrl: "https://picsum.photos/400/650?random=30",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 920,
    likes: 71
  },
  {
    title: "Chợ Nổi Cái Răng - Nét Văn Hóa Sông Nước",
    content: "Chợ nổi Cái Răng là một trong những chợ nổi nổi tiếng nhất miền Tây Nam Bộ. Chợ hoạt động từ sáng sớm, tạo nên một không gian buôn bán độc đáo...",
    author: "Admin",
    category: "Văn hóa",
    tags: ["Chợ nổi", "Cần Thơ", "Miền Tây"],
    imageUrl: "https://picsum.photos/400/650?random=31",
    publishedAt: new Date(),
    readTime: "5 phút",
    views: 750,
    likes: 52
  },
  {
    title: "Nha Trang - Thành Phố Biển Xinh Đẹp",
    content: "Nha Trang là một trong những thành phố biển đẹp nhất Việt Nam với những bãi biển dài và các đảo đẹp. Nơi đây còn nổi tiếng với văn hóa Chăm...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Nha Trang", "Biển", "Khánh Hòa"],
    imageUrl: "https://picsum.photos/400/650?random=32",
    publishedAt: new Date(),
    readTime: "7 phút",
    views: 880,
    likes: 64
  },
  {
    title: "Huế - Cố Đô Lịch Sử",
    content: "Huế từng là kinh đô của triều Nguyễn và là trung tâm văn hóa, chính trị của Việt Nam. Nơi đây còn lưu giữ nhiều di tích lịch sử quý giá...",
    author: "Admin",
    category: "Lịch sử",
    tags: ["Huế", "Cố đô", "Triều Nguyễn"],
    imageUrl: "https://picsum.photos/400/650?random=33",
    publishedAt: new Date(),
    readTime: "8 phút",
    views: 670,
    likes: 48
  },
  {
    title: "Ba Bể - Hồ Nước Ngọt Lớn Nhất Việt Nam",
    content: "Hồ Ba Bể là hồ nước ngọt tự nhiên lớn nhất Việt Nam với cảnh quan thiên nhiên hoang dã. Nơi đây còn nổi tiếng với hệ sinh thái đa dạng...",
    author: "Admin",
    category: "Thiên nhiên",
    tags: ["Ba Bể", "Hồ", "Bắc Kạn"],
    imageUrl: "https://picsum.photos/400/650?random=34",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 590,
    likes: 41
  },
  {
    title: "Côn Đảo - Đảo Tù Lịch Sử",
    content: "Côn Đảo không chỉ nổi tiếng với vẻ đẹp thiên nhiên mà còn là nơi ghi dấu nhiều sự kiện lịch sử quan trọng. Nhà tù Côn Đảo là chứng tích...",
    author: "Admin",
    category: "Lịch sử",
    tags: ["Côn Đảo", "Nhà tù", "Lịch sử"],
    imageUrl: "https://picsum.photos/400/650?random=35",
    publishedAt: new Date(),
    readTime: "7 phút",
    views: 480,
    likes: 35
  },
  {
    title: "Y Tý - Nóc Nhà Tây Bắc",
    content: "Y Tý là một trong những đỉnh núi cao nhất Tây Bắc với độ cao trên 3000m. Nơi đây nổi tiếng với cảnh quan núi non hùng vĩ và văn hóa...",
    author: "Admin",
    category: "Mạo hiểm",
    tags: ["Y Tý", "Núi", "Tây Bắc"],
    imageUrl: "https://picsum.photos/400/650?random=36",
    publishedAt: new Date(),
    readTime: "9 phút",
    views: 420,
    likes: 29
  },
  {
    title: "Mũi Né - Biển Cát Đỏ Độc Đáo",
    content: "Mũi Né nổi tiếng với những đồi cát đỏ độc đáo và những bãi biển đẹp. Nơi đây còn là điểm đến lý tưởng cho các môn thể thao biển...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Mũi Né", "Cát đỏ", "Biển"],
    imageUrl: "https://picsum.photos/400/650?random=37",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 780,
    likes: 58
  },
  {
    title: "Bạch Mã - Vườn Quốc Gia",
    content: "Vườn quốc gia Bạch Mã là một trong những vườn quốc gia đẹp nhất Việt Nam với hệ sinh thái đa dạng và cảnh quan thiên nhiên hoang dã...",
    author: "Admin",
    category: "Thiên nhiên",
    tags: ["Bạch Mã", "Vườn quốc gia", "Huế"],
    imageUrl: "https://picsum.photos/400/650?random=38",
    publishedAt: new Date(),
    readTime: "7 phút",
    views: 520,
    likes: 37
  },
  {
    title: "Cát Bà - Đảo Khỉ Xinh Đẹp",
    content: "Cát Bà là hòn đảo lớn nhất trong quần thể đảo Cát Bà với vẻ đẹp hoang sơ và hệ sinh thái đa dạng. Nơi đây còn nổi tiếng với vườn quốc gia...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Cát Bà", "Đảo", "Hải Phòng"],
    imageUrl: "https://picsum.photos/400/650?random=39",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 650,
    likes: 46
  },
  {
    title: "Tam Đảo - Núi Mây Mát Mẻ",
    content: "Tam Đảo là một khu nghỉ dưỡng nổi tiếng với khí hậu mát mẻ quanh năm. Nơi đây còn nổi tiếng với cảnh quan thiên nhiên đẹp và ẩm thực...",
    author: "Admin",
    category: "Nghỉ dưỡng",
    tags: ["Tam Đảo", "Núi", "Vĩnh Phúc"],
    imageUrl: "https://picsum.photos/400/650?random=40",
    publishedAt: new Date(),
    readTime: "5 phút",
    views: 580,
    likes: 42
  }
]

// Function to seed tours data
export const seedToursData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu tours...')
    
    for (let i = 0; i < sampleTours.length; i++) {
      const tour = sampleTours[i]
      await addDoc(collection(db, 'TOURS'), {
        ...tour,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        featured: i < 5, // First 5 tours are featured
        slug: tour.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
      })
      console.log(`✅ Đã thêm tour: ${tour.name}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleTours.length} tours`)
    return { success: true, count: sampleTours.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm tours:', error)
    return { success: false, error }
  }
}

// Function to seed posts data
export const seedPostsData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu posts...')
    
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i]
      await addDoc(collection(db, 'POSTS'), {
        ...post,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        featured: i < 3, // First 3 posts are featured
        slug: post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
      })
      console.log(`✅ Đã thêm post: ${post.title}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${samplePosts.length} posts`)
    return { success: true, count: samplePosts.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm posts:', error)
    return { success: false, error }
  }
}

// Function to seed all data
export const seedAllData = async () => {
  try {
    console.log('🚀 Bắt đầu thêm tất cả dữ liệu...')
    
    const toursResult = await seedToursData()
    const postsResult = await seedPostsData()
    
    if (toursResult.success && postsResult.success) {
      console.log(`🎉 Hoàn thành tất cả! Đã thêm ${toursResult.count} tours và ${postsResult.count} posts`)
      return { success: true, tours: toursResult.count, posts: postsResult.count }
    } else {
      throw new Error('Có lỗi xảy ra khi thêm dữ liệu')
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error)
    return { success: false, error }
  }
}
