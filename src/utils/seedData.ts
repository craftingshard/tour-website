import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

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
    description: "Khám phá thành phố mộng mơ với khí hậu mát mẻ quanh năm. Thăm các vườn hoa, đồi chè và thưởng thức ẩm thực độc đáo.",
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

// Sample customers data
const sampleCustomers = [
  {
    displayName: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phoneNumber: "0901234567",
    role: "customer",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "1990-05-15",
    preferences: ["Biển", "Văn hóa", "Ẩm thực"],
    totalBookings: 3,
    totalSpent: 8500000,
    createdAt: new Date()
  },
  {
    displayName: "Trần Thị Bình",
    email: "tranthibinh@email.com",
    phoneNumber: "0912345678",
    role: "customer",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    dateOfBirth: "1985-08-22",
    preferences: ["Núi", "Trekking", "Homestay"],
    totalBookings: 5,
    totalSpent: 12000000,
    createdAt: new Date()
  },
  {
    displayName: "Lê Văn Cường",
    email: "levancuong@email.com",
    phoneNumber: "0923456789",
    role: "customer",
    address: "789 Đường DEF, Quận 5, TP.HCM",
    dateOfBirth: "1992-12-10",
    preferences: ["Thành phố", "Lịch sử", "Mua sắm"],
    totalBookings: 2,
    totalSpent: 4500000,
    createdAt: new Date()
  },
  {
    displayName: "Phạm Thị Dung",
    email: "phamthidung@email.com",
    phoneNumber: "0934567890",
    role: "customer",
    address: "321 Đường GHI, Quận 7, TP.HCM",
    dateOfBirth: "1988-03-18",
    preferences: ["Biển", "Spa", "Resort"],
    totalBookings: 4,
    totalSpent: 9800000,
    createdAt: new Date()
  },
  {
    displayName: "Hoàng Văn Em",
    email: "hoangvanem@email.com",
    phoneNumber: "0945678901",
    role: "customer",
    address: "654 Đường JKL, Quận 10, TP.HCM",
    dateOfBirth: "1995-07-25",
    preferences: ["Mạo hiểm", "Thể thao", "Nhóm"],
    totalBookings: 6,
    totalSpent: 15000000,
    createdAt: new Date()
  },
  {
    displayName: "Vũ Thị Phương",
    email: "vuthiphuong@email.com",
    phoneNumber: "0956789012",
    role: "customer",
    address: "987 Đường MNO, Quận 2, TP.HCM",
    dateOfBirth: "1991-11-30",
    preferences: ["Nghỉ dưỡng", "Yoga", "Thiền"],
    totalBookings: 3,
    totalSpent: 7200000,
    createdAt: new Date()
  },
  {
    displayName: "Đặng Văn Giang",
    email: "dangvangiang@email.com",
    phoneNumber: "0967890123",
    role: "customer",
    address: "147 Đường PQR, Quận 4, TP.HCM",
    dateOfBirth: "1987-04-12",
    preferences: ["Sông nước", "Làng nghề", "Ẩm thực"],
    totalBookings: 4,
    totalSpent: 8900000,
    createdAt: new Date()
  },
  {
    displayName: "Bùi Thị Hoa",
    email: "buithihoa@email.com",
    phoneNumber: "0978901234",
    role: "customer",
    address: "258 Đường STU, Quận 6, TP.HCM",
    dateOfBirth: "1993-09-05",
    preferences: ["Hoa", "Vườn", "Nhiếp ảnh"],
    totalBookings: 2,
    totalSpent: 3800000,
    createdAt: new Date()
  },
  {
    displayName: "Ngô Văn Khoa",
    email: "ngovankhoa@email.com",
    phoneNumber: "0989012345",
    role: "customer",
    address: "369 Đường VWX, Quận 8, TP.HCM",
    dateOfBirth: "1989-06-20",
    preferences: ["Công nghệ", "Thành phố thông minh", "Startup"],
    totalBookings: 3,
    totalSpent: 5600000,
    createdAt: new Date()
  },
  {
    displayName: "Lý Thị Lan",
    email: "lythilan@email.com",
    phoneNumber: "0990123456",
    role: "customer",
    address: "741 Đường YZA, Quận 9, TP.HCM",
    dateOfBirth: "1994-01-08",
    preferences: ["Nghệ thuật", "Bảo tàng", "Triển lãm"],
    totalBookings: 5,
    totalSpent: 11000000,
    createdAt: new Date()
  },
  {
    displayName: "Trịnh Văn Minh",
    email: "trinhvanminh@email.com",
    phoneNumber: "0991234567",
    role: "customer",
    address: "852 Đường BCD, Quận 11, TP.HCM",
    dateOfBirth: "1986-10-14",
    preferences: ["Golf", "Thể thao", "Sang trọng"],
    totalBookings: 4,
    totalSpent: 13500000,
    createdAt: new Date()
  },
  {
    displayName: "Đinh Thị Nga",
    email: "dinhthinga@email.com",
    phoneNumber: "0992345678",
    role: "customer",
    address: "963 Đường EFG, Quận 12, TP.HCM",
    dateOfBirth: "1990-02-28",
    preferences: ["Sức khỏe", "Thể dục", "Dinh dưỡng"],
    totalBookings: 3,
    totalSpent: 6700000,
    createdAt: new Date()
  },
  {
    displayName: "Tô Văn Phúc",
    email: "tovanphuc@email.com",
    phoneNumber: "0993456789",
    role: "customer",
    address: "159 Đường HIJ, Quận Bình Tân, TP.HCM",
    dateOfBirth: "1992-12-03",
    preferences: ["Cộng đồng", "Tình nguyện", "Học tập"],
    totalBookings: 2,
    totalSpent: 4200000,
    createdAt: new Date()
  },
  {
    displayName: "Hồ Thị Quỳnh",
    email: "hothiquynh@email.com",
    phoneNumber: "0994567890",
    role: "customer",
    address: "357 Đường KLM, Quận Bình Thạnh, TP.HCM",
    dateOfBirth: "1988-07-17",
    preferences: ["Gia đình", "Trẻ em", "Giáo dục"],
    totalBookings: 4,
    totalSpent: 7800000,
    createdAt: new Date()
  },
  {
    displayName: "Dương Văn Rồng",
    email: "duongvanrong@email.com",
    phoneNumber: "0995678901",
    role: "customer",
    address: "486 Đường NOP, Quận Tân Bình, TP.HCM",
    dateOfBirth: "1991-05-25",
    preferences: ["Kinh doanh", "Networking", "Hội thảo"],
    totalBookings: 3,
    totalSpent: 9200000,
    createdAt: new Date()
  }
]

// Sample staff data
const sampleStaff = [
  {
    displayName: "Nguyễn Văn Admin",
    email: "admin@tourwebsite.com",
    role: "admin",
    uid: "admin001",
    department: "Quản lý",
    position: "Quản lý tổng",
    phoneNumber: "0900000001",
    salary: 25000000,
    hireDate: "2023-01-15",
    status: "active",
    permissions: ["all"],
    createdAt: new Date()
  },
  {
    displayName: "Trần Thị Manager",
    email: "manager@tourwebsite.com",
    role: "manager",
    uid: "manager001",
    department: "Kinh doanh",
    position: "Trưởng phòng kinh doanh",
    phoneNumber: "0900000002",
    salary: 18000000,
    hireDate: "2023-03-20",
    status: "active",
    permissions: ["tours", "bookings", "customers"],
    createdAt: new Date()
  },
  {
    displayName: "Lê Văn Sales",
    email: "sales@tourwebsite.com",
    role: "sales",
    uid: "sales001",
    department: "Kinh doanh",
    position: "Nhân viên kinh doanh",
    phoneNumber: "0900000003",
    salary: 12000000,
    hireDate: "2023-05-10",
    status: "active",
    permissions: ["tours", "bookings"],
    createdAt: new Date()
  },
  {
    displayName: "Phạm Thị Content",
    email: "content@tourwebsite.com",
    role: "content",
    uid: "content001",
    department: "Marketing",
    position: "Nhân viên nội dung",
    phoneNumber: "0900000004",
    salary: 11000000,
    hireDate: "2023-06-15",
    status: "active",
    permissions: ["posts", "tours"],
    createdAt: new Date()
  },
  {
    displayName: "Hoàng Văn Support",
    email: "support@tourwebsite.com",
    role: "support",
    uid: "support001",
    department: "Chăm sóc khách hàng",
    position: "Nhân viên hỗ trợ",
    phoneNumber: "0900000005",
    salary: 10000000,
    hireDate: "2023-07-01",
    status: "active",
    permissions: ["bookings", "customers"],
    createdAt: new Date()
  },
  {
    displayName: "Vũ Thị Finance",
    email: "finance@tourwebsite.com",
    role: "finance",
    uid: "finance001",
    department: "Tài chính",
    position: "Kế toán",
    phoneNumber: "0900000006",
    salary: 15000000,
    hireDate: "2023-08-10",
    status: "active",
    permissions: ["bookings", "affiliates", "reports"],
    createdAt: new Date()
  },
  {
    displayName: "Đặng Văn Guide",
    email: "guide@tourwebsite.com",
    role: "guide",
    uid: "guide001",
    department: "Hướng dẫn",
    position: "Hướng dẫn viên",
    phoneNumber: "0900000007",
    salary: 13000000,
    hireDate: "2023-09-05",
    status: "active",
    permissions: ["tours"],
    createdAt: new Date()
  },
  {
    displayName: "Bùi Thị Marketing",
    email: "marketing@tourwebsite.com",
    role: "marketing",
    uid: "marketing001",
    department: "Marketing",
    position: "Nhân viên marketing",
    phoneNumber: "0900000008",
    salary: 12000000,
    hireDate: "2023-10-12",
    status: "active",
    permissions: ["posts", "affiliates"],
    createdAt: new Date()
  },
  {
    displayName: "Ngô Văn IT",
    email: "it@tourwebsite.com",
    role: "developer",
    uid: "developer001",
    department: "Công nghệ",
    position: "Lập trình viên",
    phoneNumber: "0900000009",
    salary: 20000000,
    hireDate: "2023-11-20",
    status: "active",
    permissions: ["all"],
    createdAt: new Date()
  },
  {
    displayName: "Lý Thị HR",
    email: "hr@tourwebsite.com",
    role: "hr",
    uid: "hr001",
    department: "Nhân sự",
    position: "Nhân viên nhân sự",
    phoneNumber: "0900000010",
    salary: 11000000,
    hireDate: "2023-12-01",
    status: "active",
    permissions: ["staff"],
    createdAt: new Date()
  }
]

// Sample affiliates data
const sampleAffiliates = [
  {
    name: "Công ty Du lịch ABC",
    email: "info@abctravel.com",
    phone: "02812345678",
    website: "https://abctravel.com",
    commission: 15,
    status: "active",
    active: true,
    address: "123 Đường ABC, Quận 1, TP.HCM",
    contactPerson: "Nguyễn Văn A",
    contactPhone: "0901234567",
    bankAccount: "1234567890",
    bankName: "Vietcombank",
    totalEarnings: 25000000,
    paidAmount: 15000000,
    pendingAmount: 10000000,
    totalBookings: 45,
    conversionRate: 8.5,
    createdAt: new Date()
  },
  {
    name: "Công ty Lữ hành XYZ",
    email: "contact@xyztravel.com",
    phone: "02823456789",
    website: "https://xyztravel.com",
    commission: 12,
    status: "active",
    active: true,
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    contactPerson: "Trần Thị B",
    contactPhone: "0912345678",
    bankAccount: "2345678901",
    bankName: "BIDV",
    totalEarnings: 18000000,
    paidAmount: 12000000,
    pendingAmount: 6000000,
    totalBookings: 32,
    conversionRate: 7.2,
    createdAt: new Date()
  },
  {
    name: "Công ty Du thuyền DEF",
    email: "info@defcruise.com",
    phone: "02834567890",
    website: "https://defcruise.com",
    commission: 18,
    status: "active",
    active: true,
    address: "789 Đường DEF, Quận 5, TP.HCM",
    contactPerson: "Lê Văn C",
    contactPhone: "0923456789",
    bankAccount: "3456789012",
    bankName: "Agribank",
    totalEarnings: 32000000,
    paidAmount: 25000000,
    pendingAmount: 7000000,
    totalBookings: 58,
    conversionRate: 9.1,
    createdAt: new Date()
  },
  {
    name: "Công ty Khám phá GHI",
    email: "hello@ghiexplore.com",
    phone: "02845678901",
    website: "https://ghiexplore.com",
    commission: 14,
    status: "active",
    active: true,
    address: "321 Đường GHI, Quận 7, TP.HCM",
    contactPerson: "Phạm Thị D",
    contactPhone: "0934567890",
    bankAccount: "4567890123",
    bankName: "Techcombank",
    totalEarnings: 15000000,
    paidAmount: 10000000,
    pendingAmount: 5000000,
    totalBookings: 28,
    conversionRate: 6.8,
    createdAt: new Date()
  },
  {
    name: "Công ty Mạo hiểm JKL",
    email: "adventure@jkladventure.com",
    phone: "02856789012",
    website: "https://jkladventure.com",
    commission: 20,
    status: "active",
    active: true,
    address: "654 Đường JKL, Quận 10, TP.HCM",
    contactPerson: "Hoàng Văn E",
    contactPhone: "0945678901",
    bankAccount: "5678901234",
    bankName: "MB Bank",
    totalEarnings: 28000000,
    paidAmount: 20000000,
    pendingAmount: 8000000,
    totalBookings: 42,
    conversionRate: 8.9,
    createdAt: new Date()
  },
  {
    name: "Công ty Nghỉ dưỡng MNO",
    email: "resort@mnoresort.com",
    phone: "02867890123",
    website: "https://mnoresort.com",
    commission: 16,
    status: "active",
    active: true,
    address: "987 Đường MNO, Quận 2, TP.HCM",
    contactPerson: "Vũ Thị F",
    contactPhone: "0956789012",
    bankAccount: "6789012345",
    bankName: "ACB",
    totalEarnings: 22000000,
    paidAmount: 18000000,
    pendingAmount: 4000000,
    totalBookings: 35,
    conversionRate: 7.5,
    createdAt: new Date()
  },
  {
    name: "Công ty Văn hóa PQR",
    email: "culture@pqrculture.com",
    phone: "02878901234",
    website: "https://pqrculture.com",
    commission: 13,
    status: "active",
    active: true,
    address: "147 Đường PQR, Quận 4, TP.HCM",
    contactPerson: "Đặng Văn G",
    contactPhone: "0967890123",
    bankAccount: "7890123456",
    bankName: "Sacombank",
    totalEarnings: 12000000,
    paidAmount: 8000000,
    pendingAmount: 4000000,
    totalBookings: 25,
    conversionRate: 6.2,
    createdAt: new Date()
  },
  {
    name: "Công ty Thể thao STU",
    email: "sport@stusport.com",
    phone: "02889012345",
    website: "https://stusport.com",
    commission: 17,
    status: "active",
    active: true,
    address: "258 Đường STU, Quận 6, TP.HCM",
    contactPerson: "Bùi Thị H",
    contactPhone: "0978901234",
    bankAccount: "8901234567",
    bankName: "VPBank",
    totalEarnings: 19000000,
    paidAmount: 15000000,
    pendingAmount: 4000000,
    totalBookings: 30,
    conversionRate: 7.8,
    createdAt: new Date()
  }
]

// Sample bookings data
const sampleBookings = [
  {
    userId: "customer001",
    tourId: "tour001",
    tourName: "Hạ Long Bay - Vịnh Diệu Kỳ",
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@email.com",
    customerPhone: "0901234567",
    status: "confirmed",
    paid: true,
    amount: 2500000,
    affiliateId: "affiliate001",
    affiliateName: "Công ty Du lịch ABC",
    commission: 375000,
    bookingDate: new Date("2024-01-15"),
    travelDate: new Date("2024-03-20"),
    numberOfPeople: 2,
    specialRequests: "Yêu cầu phòng view biển",
    paymentMethod: "bank_transfer",
    notes: "Khách hàng VIP"
  },
  {
    userId: "customer002",
    tourId: "tour002",
    tourName: "Sapa - Núi Rừng Tây Bắc",
    customerName: "Trần Thị Bình",
    customerEmail: "tranthibinh@email.com",
    customerPhone: "0912345678",
    status: "confirmed",
    paid: true,
    amount: 1800000,
    affiliateId: "affiliate002",
    affiliateName: "Công ty Lữ hành XYZ",
    commission: 216000,
    bookingDate: new Date("2024-01-18"),
    travelDate: new Date("2024-04-15"),
    numberOfPeople: 1,
    specialRequests: "Homestay với người dân địa phương",
    paymentMethod: "credit_card",
    notes: "Khách thích trekking"
  },
  {
    userId: "customer003",
    tourId: "tour003",
    tourName: "Phú Quốc - Đảo Ngọc",
    customerName: "Lê Văn Cường",
    customerEmail: "levancuong@email.com",
    customerPhone: "0923456789",
    status: "pending",
    paid: false,
    amount: 3200000,
    affiliateId: null,
    affiliateName: null,
    commission: 0,
    bookingDate: new Date("2024-01-20"),
    travelDate: new Date("2024-05-10"),
    numberOfPeople: 3,
    specialRequests: "Resort 5 sao, phòng suite",
    paymentMethod: "pending",
    notes: "Chờ xác nhận thanh toán"
  },
  {
    userId: "customer004",
    tourId: "tour004",
    tourName: "Mai Châu - Thung Lũng Xanh",
    customerName: "Phạm Thị Dung",
    customerEmail: "phamthidung@email.com",
    customerPhone: "0934567890",
    status: "confirmed",
    paid: true,
    amount: 1200000,
    affiliateId: "affiliate003",
    affiliateName: "Công ty Du thuyền DEF",
    commission: 216000,
    bookingDate: new Date("2024-01-22"),
    travelDate: new Date("2024-02-28"),
    numberOfPeople: 2,
    specialRequests: "Xe đạp để khám phá",
    paymentMethod: "momo",
    notes: "Khách thích trải nghiệm dân dã"
  },
  {
    userId: "customer005",
    tourId: "tour005",
    tourName: "Nha Trang - Biển Xanh Cát Trắng",
    customerName: "Hoàng Văn Em",
    customerEmail: "hoangvanem@email.com",
    customerPhone: "0945678901",
    status: "confirmed",
    paid: true,
    amount: 2800000,
    affiliateId: "affiliate004",
    affiliateName: "Công ty Khám phá GHI",
    commission: 392000,
    bookingDate: new Date("2024-01-25"),
    travelDate: new Date("2024-06-12"),
    numberOfPeople: 4,
    specialRequests: "Lặn biển và thăm đảo",
    paymentMethod: "bank_transfer",
    notes: "Gia đình có trẻ em"
  },
  {
    userId: "customer006",
    tourId: "tour006",
    tourName: "Đà Lạt - Thành Phố Ngàn Hoa",
    customerName: "Vũ Thị Phương",
    customerEmail: "vuthiphuong@email.com",
    customerPhone: "0956789012",
    status: "cancelled",
    paid: false,
    amount: 2000000,
    affiliateId: "affiliate005",
    affiliateName: "Công ty Mạo hiểm JKL",
    commission: 0,
    bookingDate: new Date("2024-01-28"),
    travelDate: new Date("2024-03-25"),
    numberOfPeople: 2,
    specialRequests: "Vườn hoa và đồi chè",
    paymentMethod: "cancelled",
    notes: "Khách hủy do lý do cá nhân"
  },
  {
    userId: "customer007",
    tourId: "tour007",
    tourName: "Huế - Cố Đô Lịch Sử",
    customerName: "Đặng Văn Giang",
    customerEmail: "dangvangiang@email.com",
    customerPhone: "0967890123",
    status: "confirmed",
    paid: true,
    amount: 1600000,
    affiliateId: "affiliate006",
    affiliateName: "Công ty Nghỉ dưỡng MNO",
    commission: 256000,
    bookingDate: new Date("2024-02-01"),
    travelDate: new Date("2024-04-18"),
    numberOfPeople: 1,
    specialRequests: "Thăm Đại Nội và Lăng Khải Định",
    paymentMethod: "credit_card",
    notes: "Khách thích lịch sử"
  },
  {
    userId: "customer008",
    tourId: "tour008",
    tourName: "Hội An - Phố Cổ Ánh Đèn",
    customerName: "Bùi Thị Hoa",
    customerEmail: "buithihoa@email.com",
    customerPhone: "0978901234",
    status: "confirmed",
    paid: true,
    amount: 2200000,
    affiliateId: "affiliate007",
    affiliateName: "Công ty Văn hóa PQR",
    commission: 286000,
    bookingDate: new Date("2024-02-05"),
    travelDate: new Date("2024-05-20"),
    numberOfPeople: 2,
    specialRequests: "Làm đèn lồng và ăn cao lầu",
    paymentMethod: "momo",
    notes: "Khách thích văn hóa truyền thống"
  },
  {
    userId: "customer009",
    tourId: "tour009",
    tourName: "Mekong Delta - Chợ Nổi Cửu Long",
    customerName: "Ngô Văn Khoa",
    customerEmail: "ngovankhoa@email.com",
    customerPhone: "0989012345",
    status: "pending",
    paid: false,
    amount: 1400000,
    affiliateId: "affiliate008",
    affiliateName: "Công ty Thể thao STU",
    commission: 0,
    bookingDate: new Date("2024-02-08"),
    travelDate: new Date("2024-06-25"),
    numberOfPeople: 3,
    specialRequests: "Chợ nổi và làng nghề",
    paymentMethod: "pending",
    notes: "Chờ xác nhận thanh toán"
  },
  {
    userId: "customer010",
    tourId: "tour010",
    tourName: "Ba Bể - Hồ Nước Ngọt",
    customerName: "Lý Thị Lan",
    customerEmail: "lythilan@email.com",
    customerPhone: "0990123456",
    status: "confirmed",
    paid: true,
    amount: 1800000,
    affiliateId: "affiliate001",
    affiliateName: "Công ty Du lịch ABC",
    commission: 270000,
    bookingDate: new Date("2024-02-10"),
    travelDate: new Date("2024-07-08"),
    numberOfPeople: 2,
    specialRequests: "Đi thuyền và trekking",
    paymentMethod: "bank_transfer",
    notes: "Khách thích thiên nhiên hoang dã"
  },
  {
    userId: "customer011",
    tourId: "tour011",
    tourName: "Côn Đảo - Đảo Tù Lịch Sử",
    customerName: "Trịnh Văn Minh",
    customerEmail: "trinhvanminh@email.com",
    customerPhone: "0991234567",
    status: "confirmed",
    paid: true,
    amount: 3500000,
    affiliateId: "affiliate002",
    affiliateName: "Công ty Lữ hành XYZ",
    commission: 420000,
    bookingDate: new Date("2024-02-12"),
    travelDate: new Date("2024-08-15"),
    numberOfPeople: 2,
    specialRequests: "Thăm nhà tù và bãi biển",
    paymentMethod: "credit_card",
    notes: "Khách thích lịch sử và biển"
  },
  {
    userId: "customer012",
    tourId: "tour012",
    tourName: "Y Tý - Nóc Nhà Tây Bắc",
    customerName: "Đinh Thị Nga",
    customerEmail: "dinhthinga@email.com",
    customerPhone: "0992345678",
    status: "confirmed",
    paid: true,
    amount: 2200000,
    affiliateId: "affiliate003",
    affiliateName: "Công ty Du thuyền DEF",
    commission: 396000,
    bookingDate: new Date("2024-02-15"),
    travelDate: new Date("2024-09-20"),
    numberOfPeople: 1,
    specialRequests: "Leo núi và ngắm mây",
    paymentMethod: "momo",
    notes: "Khách thích mạo hiểm"
  },
  {
    userId: "customer013",
    tourId: "tour013",
    tourName: "Phong Nha - Hang Động Kỳ Vĩ",
    customerName: "Tô Văn Phúc",
    customerEmail: "tovanphuc@email.com",
    customerPhone: "0993456789",
    status: "confirmed",
    paid: true,
    amount: 2800000,
    affiliateId: "affiliate004",
    affiliateName: "Công ty Khám phá GHI",
    commission: 392000,
    bookingDate: new Date("2024-02-18"),
    travelDate: new Date("2024-10-12"),
    numberOfPeople: 3,
    specialRequests: "Hang Sơn Đoòng và Phong Nha",
    paymentMethod: "bank_transfer",
    notes: "Gia đình thích khám phá"
  },
  {
    userId: "customer014",
    tourId: "tour014",
    tourName: "Mũi Né - Biển Cát Đỏ",
    customerName: "Hồ Thị Quỳnh",
    customerEmail: "hothiquynh@email.com",
    customerPhone: "0994567890",
    status: "confirmed",
    paid: true,
    amount: 2400000,
    affiliateId: "affiliate005",
    affiliateName: "Công ty Mạo hiểm JKL",
    commission: 408000,
    bookingDate: new Date("2024-02-20"),
    travelDate: new Date("2024-11-08"),
    numberOfPeople: 2,
    specialRequests: "Đồi cát và lướt ván",
    paymentMethod: "credit_card",
    notes: "Khách thích thể thao biển"
  },
  {
    userId: "customer015",
    tourId: "tour015",
    tourName: "Bạch Mã - Vườn Quốc Gia",
    customerName: "Dương Văn Rồng",
    customerEmail: "duongvanrong@email.com",
    customerPhone: "0995678901",
    status: "confirmed",
    paid: true,
    amount: 1600000,
    affiliateId: "affiliate006",
    affiliateName: "Công ty Nghỉ dưỡng MNO",
    commission: 256000,
    bookingDate: new Date("2024-02-22"),
    travelDate: new Date("2024-12-15"),
    numberOfPeople: 1,
    specialRequests: "Trekking và ngắm cảnh",
    paymentMethod: "momo",
    notes: "Khách thích thiên nhiên"
  },
  {
    userId: "customer001",
    tourId: "tour016",
    tourName: "Cát Bà - Đảo Khỉ",
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@email.com",
    customerPhone: "0901234567",
    status: "confirmed",
    paid: true,
    amount: 2000000,
    affiliateId: "affiliate007",
    affiliateName: "Công ty Văn hóa PQR",
    commission: 260000,
    bookingDate: new Date("2024-02-25"),
    travelDate: new Date("2024-01-10"),
    numberOfPeople: 2,
    specialRequests: "Vườn quốc gia và bãi biển",
    paymentMethod: "bank_transfer",
    notes: "Khách hàng quay lại"
  },
  {
    userId: "customer002",
    tourId: "tour017",
    tourName: "Tam Đảo - Núi Mây",
    customerName: "Trần Thị Bình",
    customerEmail: "tranthibinh@email.com",
    customerPhone: "0912345678",
    status: "confirmed",
    paid: true,
    amount: 1400000,
    affiliateId: "affiliate008",
    affiliateName: "Công ty Thể thao STU",
    commission: 238000,
    bookingDate: new Date("2024-02-28"),
    travelDate: new Date("2024-02-15"),
    numberOfPeople: 1,
    specialRequests: "Ngắm cảnh và ăn gà",
    paymentMethod: "credit_card",
    notes: "Khách thích nghỉ dưỡng"
  },
  {
    userId: "customer003",
    tourId: "tour018",
    tourName: "Bà Nà Hills - Núi Chúa",
    customerName: "Lê Văn Cường",
    customerEmail: "levancuong@email.com",
    customerPhone: "0923456789",
    status: "confirmed",
    paid: true,
    amount: 1800000,
    affiliateId: "affiliate001",
    affiliateName: "Công ty Du lịch ABC",
    commission: 270000,
    bookingDate: new Date("2024-03-01"),
    travelDate: new Date("2024-03-20"),
    numberOfPeople: 3,
    specialRequests: "Cáp treo và chùa Linh Ứng",
    paymentMethod: "momo",
    notes: "Gia đình có trẻ em"
  },
  {
    userId: "customer004",
    tourId: "tour019",
    tourName: "Cù Lao Chàm - Đảo Xanh",
    customerName: "Phạm Thị Dung",
    customerEmail: "phamthidung@email.com",
    customerPhone: "0934567890",
    status: "confirmed",
    paid: true,
    amount: 1600000,
    affiliateId: "affiliate002",
    affiliateName: "Công ty Lữ hành XYZ",
    commission: 192000,
    bookingDate: new Date("2024-03-05"),
    travelDate: new Date("2024-04-25"),
    numberOfPeople: 2,
    specialRequests: "Lặn biển và bãi biển",
    paymentMethod: "bank_transfer",
    notes: "Khách thích biển hoang sơ"
  },
  {
    userId: "customer005",
    tourId: "tour020",
    tourName: "Pù Luông - Ruộng Bậc Thang",
    customerName: "Hoàng Văn Em",
    customerEmail: "hoangvanem@email.com",
    customerPhone: "0945678901",
    status: "confirmed",
    paid: true,
    amount: 1400000,
    affiliateId: "affiliate003",
    affiliateName: "Công ty Du thuyền DEF",
    commission: 252000,
    bookingDate: new Date("2024-03-08"),
    travelDate: new Date("2024-05-30"),
    numberOfPeople: 2,
    specialRequests: "Ruộng bậc thang và trekking",
    paymentMethod: "credit_card",
    notes: "Khách thích nông thôn"
  },
  {
    userId: "customer006",
    tourId: "tour001",
    tourName: "Hạ Long Bay - Vịnh Diệu Kỳ",
    customerName: "Vũ Thị Phương",
    customerEmail: "vuthiphuong@email.com",
    customerPhone: "0956789012",
    status: "confirmed",
    paid: true,
    amount: 2500000,
    affiliateId: "affiliate004",
    affiliateName: "Công ty Khám phá GHI",
    commission: 350000,
    bookingDate: new Date("2024-03-10"),
    travelDate: new Date("2024-06-18"),
    numberOfPeople: 2,
    specialRequests: "Kayak và thăm hang động",
    paymentMethod: "momo",
    notes: "Khách thích mạo hiểm"
  },
  {
    userId: "customer007",
    tourId: "tour002",
    tourName: "Sapa - Núi Rừng Tây Bắc",
    customerName: "Đặng Văn Giang",
    customerEmail: "dangvangiang@email.com",
    customerPhone: "0967890123",
    status: "confirmed",
    paid: true,
    amount: 1800000,
    affiliateId: "affiliate005",
    affiliateName: "Công ty Mạo hiểm JKL",
    commission: 306000,
    bookingDate: new Date("2024-03-12"),
    travelDate: new Date("2024-07-25"),
    numberOfPeople: 1,
    specialRequests: "Leo Fansipan và homestay",
    paymentMethod: "bank_transfer",
    notes: "Khách thích leo núi"
  },
  {
    userId: "customer008",
    tourId: "tour003",
    tourName: "Phú Quốc - Đảo Ngọc",
    customerName: "Bùi Thị Hoa",
    customerEmail: "buithihoa@email.com",
    customerPhone: "0978901234",
    status: "confirmed",
    paid: true,
    amount: 3200000,
    affiliateId: "affiliate006",
    affiliateName: "Công ty Nghỉ dưỡng MNO",
    commission: 512000,
    bookingDate: new Date("2024-03-15"),
    travelDate: new Date("2024-08-30"),
    numberOfPeople: 3,
    specialRequests: "Resort 5 sao và spa",
    paymentMethod: "credit_card",
    notes: "Gia đình thích nghỉ dưỡng"
  },
  {
    userId: "customer009",
    tourId: "tour004",
    tourName: "Mai Châu - Thung Lũng Xanh",
    customerName: "Ngô Văn Khoa",
    customerEmail: "ngovankhoa@email.com",
    customerPhone: "0989012345",
    status: "confirmed",
    paid: true,
    amount: 1200000,
    affiliateId: "affiliate007",
    affiliateName: "Công ty Văn hóa PQR",
    commission: 156000,
    bookingDate: new Date("2024-03-18"),
    travelDate: new Date("2024-09-15"),
    numberOfPeople: 2,
    specialRequests: "Xe đạp và múa xòe",
    paymentMethod: "momo",
    notes: "Khách thích văn hóa dân tộc"
  },
  {
    userId: "customer010",
    tourId: "tour005",
    tourName: "Nha Trang - Biển Xanh Cát Trắng",
    customerName: "Lý Thị Lan",
    customerEmail: "lythilan@email.com",
    customerPhone: "0990123456",
    status: "confirmed",
    paid: true,
    amount: 2800000,
    affiliateId: "affiliate008",
    affiliateName: "Công ty Thể thao STU",
    commission: 476000,
    bookingDate: new Date("2024-03-20"),
    travelDate: new Date("2024-10-20"),
    numberOfPeople: 2,
    specialRequests: "Lặn biển và tháp Bà",
    paymentMethod: "bank_transfer",
    notes: "Khách thích biển và văn hóa"
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

// Function to seed customers data
export const seedCustomersData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu khách hàng...')
    
    const sampleCustomers = [
      {
        displayName: "Nguyễn Văn An",
        email: "nguyenvanan@email.com",
        phoneNumber: "0901234567",
        role: "customer",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        dateOfBirth: "1990-05-15",
        preferences: ["Biển", "Văn hóa", "Ẩm thực"],
        totalBookings: 3,
        totalSpent: 8500000,
        createdAt: new Date()
      },
      {
        displayName: "Trần Thị Bình",
        email: "tranthibinh@email.com",
        phoneNumber: "0912345678",
        role: "customer",
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        dateOfBirth: "1985-08-22",
        preferences: ["Núi", "Trekking", "Homestay"],
        totalBookings: 5,
        totalSpent: 12000000,
        createdAt: new Date()
      },
      {
        displayName: "Lê Văn Cường",
        email: "levancuong@email.com",
        phoneNumber: "0923456789",
        role: "customer",
        address: "789 Đường DEF, Quận 5, TP.HCM",
        dateOfBirth: "1992-12-10",
        preferences: ["Thành phố", "Lịch sử", "Mua sắm"],
        totalBookings: 2,
        totalSpent: 4500000,
        createdAt: new Date()
      },
      {
        displayName: "Phạm Thị Dung",
        email: "phamthidung@email.com",
        phoneNumber: "0934567890",
        role: "customer",
        address: "321 Đường GHI, Quận 7, TP.HCM",
        dateOfBirth: "1988-03-18",
        preferences: ["Biển", "Spa", "Resort"],
        totalBookings: 4,
        totalSpent: 9800000,
        createdAt: new Date()
      },
      {
        displayName: "Hoàng Văn Em",
        email: "hoangvanem@email.com",
        phoneNumber: "0945678901",
        role: "customer",
        address: "654 Đường JKL, Quận 10, TP.HCM",
        dateOfBirth: "1995-07-25",
        preferences: ["Mạo hiểm", "Thể thao", "Nhóm"],
        totalBookings: 6,
        totalSpent: 15000000,
        createdAt: new Date()
      }
    ]
    
    for (let i = 0; i < sampleCustomers.length; i++) {
      const customer = sampleCustomers[i]
      await addDoc(collection(db, 'users'), {
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      })
      console.log(`✅ Đã thêm khách hàng: ${customer.displayName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleCustomers.length} khách hàng`)
    return { success: true, count: sampleCustomers.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm khách hàng:', error)
    return { success: false, error }
  }
}

// Function to seed staff data
export const seedStaffData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu nhân viên...')
    
    const sampleStaff = [
      {
        displayName: "Nguyễn Văn Admin",
        email: "admin@tourwebsite.com",
        role: "admin",
        uid: "admin001",
        department: "Quản lý",
        position: "Quản lý tổng",
        phoneNumber: "0900000001",
        salary: 25000000,
        hireDate: "2023-01-15",
        status: "active",
        permissions: ["all"],
        createdAt: new Date()
      },
      {
        displayName: "Trần Thị Manager",
        email: "manager@tourwebsite.com",
        role: "manager",
        uid: "manager001",
        department: "Kinh doanh",
        position: "Trưởng phòng kinh doanh",
        phoneNumber: "0900000002",
        salary: 18000000,
        hireDate: "2023-03-20",
        status: "active",
        permissions: ["tours", "bookings", "customers"],
        createdAt: new Date()
      },
      {
        displayName: "Lê Văn Sales",
        email: "sales@tourwebsite.com",
        role: "sales",
        uid: "sales001",
        department: "Kinh doanh",
        position: "Nhân viên kinh doanh",
        phoneNumber: "0900000003",
        salary: 12000000,
        hireDate: "2023-05-10",
        status: "active",
        permissions: ["tours", "bookings"],
        createdAt: new Date()
      }
    ]
    
    for (let i = 0; i < sampleStaff.length; i++) {
      const staff = sampleStaff[i]
      await addDoc(collection(db, 'admins'), {
        ...staff,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm nhân viên: ${staff.displayName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleStaff.length} nhân viên`)
    return { success: true, count: sampleStaff.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm nhân viên:', error)
    return { success: false, error }
  }
}

// Function to seed affiliates data
export const seedAffiliatesData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu đối tác affiliate...')
    
    const sampleAffiliates = [
      {
        name: "Công ty Du lịch ABC",
        email: "info@abctravel.com",
        phone: "02812345678",
        website: "https://abctravel.com",
        commission: 15,
        status: "active",
        active: true,
        address: "123 Đường ABC, Quận 1, TP.HCM",
        contactPerson: "Nguyễn Văn A",
        contactPhone: "0901234567",
        bankAccount: "1234567890",
        bankName: "Vietcombank",
        totalEarnings: 25000000,
        paidAmount: 15000000,
        pendingAmount: 10000000,
        totalBookings: 45,
        conversionRate: 8.5,
        createdAt: new Date()
      },
      {
        name: "Công ty Lữ hành XYZ",
        email: "contact@xyztravel.com",
        phone: "02823456789",
        website: "https://xyztravel.com",
        commission: 12,
        status: "active",
        active: true,
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        contactPerson: "Trần Thị B",
        contactPhone: "0912345678",
        bankAccount: "2345678901",
        bankName: "BIDV",
        totalEarnings: 18000000,
        paidAmount: 12000000,
        pendingAmount: 6000000,
        totalBookings: 32,
        conversionRate: 7.2,
        createdAt: new Date()
      },
      {
        name: "Công ty Du thuyền DEF",
        email: "info@defcruise.com",
        phone: "02834567890",
        website: "https://defcruise.com",
        commission: 18,
        status: "active",
        active: true,
        address: "789 Đường DEF, Quận 5, TP.HCM",
        contactPerson: "Lê Văn C",
        contactPhone: "0923456789",
        bankAccount: "3456789012",
        bankName: "Agribank",
        totalEarnings: 32000000,
        paidAmount: 25000000,
        pendingAmount: 7000000,
        totalBookings: 58,
        conversionRate: 9.1,
        createdAt: new Date()
      }
    ]
    
    for (let i = 0; i < sampleAffiliates.length; i++) {
      const affiliate = sampleAffiliates[i]
      await addDoc(collection(db, 'affiliates'), {
        ...affiliate,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm đối tác affiliate: ${affiliate.name}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleAffiliates.length} đối tác affiliate`)
    return { success: true, count: sampleAffiliates.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm đối tác affiliate:', error)
    return { success: false, error }
  }
}

// Function to seed bookings data
export const seedBookingsData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu đặt tour...')
    
    const sampleBookings = [
      {
        userId: "customer001",
        tourId: "tour001",
        tourName: "Hạ Long Bay - Vịnh Diệu Kỳ",
        customerName: "Nguyễn Văn An",
        customerEmail: "nguyenvanan@email.com",
        customerPhone: "0901234567",
        status: "confirmed",
        paid: true,
        amount: 2500000,
        affiliateId: "affiliate001",
        affiliateName: "Công ty Du lịch ABC",
        commission: 375000,
        bookingDate: new Date("2024-01-15"),
        travelDate: new Date("2024-03-20"),
        numberOfPeople: 2,
        specialRequests: "Yêu cầu phòng view biển",
        paymentMethod: "bank_transfer",
        notes: "Khách hàng VIP"
      },
      {
        userId: "customer002",
        tourId: "tour002",
        tourName: "Sapa - Núi Rừng Tây Bắc",
        customerName: "Trần Thị Bình",
        customerEmail: "tranthibinh@email.com",
        customerPhone: "0912345678",
        status: "confirmed",
        paid: true,
        amount: 1800000,
        affiliateId: "affiliate002",
        affiliateName: "Công ty Lữ hành XYZ",
        commission: 216000,
        bookingDate: new Date("2024-01-18"),
        travelDate: new Date("2024-04-15"),
        numberOfPeople: 1,
        specialRequests: "Homestay với người dân địa phương",
        paymentMethod: "credit_card",
        notes: "Khách thích trekking"
      },
      {
        userId: "customer003",
        tourId: "tour003",
        tourName: "Phú Quốc - Đảo Ngọc",
        customerName: "Lê Văn Cường",
        customerEmail: "levancuong@email.com",
        customerPhone: "0923456789",
        status: "pending",
        paid: false,
        amount: 3200000,
        affiliateId: null,
        affiliateName: null,
        commission: 0,
        bookingDate: new Date("2024-01-20"),
        travelDate: new Date("2024-05-10"),
        numberOfPeople: 3,
        specialRequests: "Resort 5 sao, phòng suite",
        paymentMethod: "pending",
        notes: "Chờ xác nhận thanh toán"
      }
    ]
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const booking = sampleBookings[i]
      await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm đặt tour: ${booking.tourName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleBookings.length} đặt tour`)
    return { success: true, count: sampleBookings.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm đặt tour:', error)
    return { success: false, error }
  }
}
