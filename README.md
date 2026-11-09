# Dữ liệu Lab

Web thực hành dữ liệu và học máy dành cho học sinh khối 6–8, thiết kế cho thao tác cảm ứng trên iPad.

## Chức năng

- Nhận xét 10 tình huống về chất lượng, nhãn và độ đa dạng của dữ liệu.
- Thêm hoặc chụp ảnh cho hai nhóm đồ vật, huấn luyện bộ phân loại k-NN đơn giản.
- Kiểm tra bằng ảnh mới, ghi nhãn thật và so sánh các lượt.
- Lưu nhật ký tại trình duyệt và tải báo cáo văn bản.

Không có backend, tài khoản hay API key. Ảnh được xử lý trong bộ nhớ của trình duyệt, không gửi lên máy chủ. Tải lại trang sẽ xóa ảnh và mô hình. Nhật ký lưu trong localStorage của thiết bị.

## Cách chạy

Mở `index.html` trong trình duyệt hoặc phục vụ thư mục bằng máy chủ tĩnh. Nếu có Python:

```sh
python -m http.server 8000
```

Mở `http://localhost:8000`. Không cần cài thư viện JavaScript.

## GitHub Pages

Trong repository: **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
Chờ lần triển khai đầu hoàn tất. Trang web sử dụng đường dẫn tương đối nên chạy được dưới đường dẫn con của GitHub Pages.

## Quy trình thực hành

1. Chọn hai đồ vật, ví dụ cốc và chai. Đặt đúng hai nhãn.
2. Thêm ít nhất 6 ảnh mỗi nhãn với các góc và nền phù hợp. Công cụ yêu cầu tối thiểu 3, tối đa 36 ảnh mỗi nhãn.
3. Giữ riêng 4 ảnh kiểm tra mới, có cả hai nhãn. Không đưa ảnh kiểm tra vào dữ liệu huấn luyện.
4. Huấn luyện, kiểm tra từng ảnh và chọn nhãn thật để ghi đúng/sai.
5. Lưu lượt trước khi sửa dữ liệu. Bổ sung dữ liệu, huấn luyện lại và kiểm tra cùng 4 ảnh.
6. Viết kết luận trong nhật ký và tải báo cáo.

## Phạm vi mô hình

Mô hình dùng k=3 trên ảnh thu nhỏ thành 16×16 điểm ảnh RGB. Giai đoạn huấn luyện lưu mẫu có nhãn; giai đoạn dự đoán chọn nhóm được đa số ba ví dụ gần nhất bỏ phiếu. Đây là mô hình đơn giản để học quy trình, khác mô hình học sâu của Teachable Machine và dễ bị nền, ánh sáng, kích thước vật ảnh hưởng.

Phiếu bầu 3/3 không phải xác suất chắc chắn đúng. Bộ ảnh minh họa là hình vẽ tổng hợp và được ghi rõ trong báo cáo. Kết quả trên bốn ảnh là phép thử nhỏ, không chứng minh khả năng nhận dạng trong mọi tình huống.

## iPad

Nên dùng Safari. Nếu nút Chụp ảnh không mở camera, chụp bằng ứng dụng Camera rồi thêm ảnh từ thư viện. Giáo viên cần kiểm tra thao tác trên iPad thật trước buổi học. Không dùng ảnh mặt học sinh hoặc thông tin cá nhân.

## Nguồn tham khảo

- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course)
- [Google PAIR: Searching for Unintended Biases](https://pair.withgoogle.com/explorables/saliency/)
