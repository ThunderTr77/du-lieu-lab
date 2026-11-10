# Dữ liệu Lab

Web thực hành cho học sinh khối 6–8, mỗi em dùng một iPad.

**Mở web:** https://thundertr77.github.io/du-lieu-lab/

## Bốn trạm thực hành

- **Chọn dữ liệu:** 10 tình huống có hình minh họa, nhận xét và giải thích theo từng nhiệm vụ.
- **Xưởng dữ liệu:** gán nhãn 12 ảnh cốc/chai, sửa nhãn sai và chuyển bộ ảnh sang huấn luyện. Lọc bản sao trong 10 thẻ ảnh, giữ lại 6 ảnh khác nhau.
- **Huấn luyện ảnh:** đặt hai nhãn, thêm ảnh tự chụp, xóa từng ảnh, huấn luyện rồi thử bằng ảnh mới. Mục tiêu 6 ảnh mỗi nhãn; tối thiểu 3 và tối đa 36.
- **Nhật ký:** lưu từng lượt, so sánh số ảnh đúng và tải báo cáo văn bản.

## Kho ảnh tải xuống

Mở `tai-anh.html` để tải từng JPEG hoặc ba bộ ZIP: 12 ảnh huấn luyện, 8 ảnh kiểm tra độc lập và 8 ảnh thí nghiệm nền. Giải nén trong ứng dụng Tệp trên iPad. Ảnh được tạo để minh họa, không phải kết quả thí nghiệm. Ảnh kiểm tra khác ảnh huấn luyện; một phần bộ nền có thể trùng bộ huấn luyện để đối chiếu điều kiện chụp.

Các liên kết trực tiếp: `#quality`, `#workshop-labels`, `#workshop-duplicates`, `#model`, `#report`. Hoạt động gán nhãn chuyển 12 ảnh học và 4 ảnh kiểm tra riêng sang phòng huấn luyện. Kết quả từ ảnh thư viện được ghi rõ nguồn, tách khỏi nguồn ảnh học sinh tự thêm.

Bộ ảnh kiểm tra được giữ riêng trong bộ nhớ để có thể dùng lại cho lượt hai. Mỗi ảnh chỉ được ghi một lần trong một lượt; ảnh đã dùng huấn luyện không được tính làm ảnh kiểm tra mới. Giao diện hiển thị ba ảnh mẫu gần nhất mà mô hình đã dùng để dự đoán.

## Mô hình và giới hạn

Đây là k-NN với k=3 trên ảnh thu nhỏ 16×16 RGB. Huấn luyện lưu một bản dữ liệu; dự đoán so sánh khoảng cách điểm ảnh. Nền, vị trí và ánh sáng có thể ảnh hưởng mạnh. Không tương đương mô hình học sâu của Teachable Machine. Phiếu bầu 3/3 không phải xác suất chắc chắn đúng. So sánh hai lượt chỉ có ý nghĩa khi dùng cùng bộ ảnh kiểm tra và cùng cách chấm.

Bộ hình vẽ tích hợp chỉ dùng để thử thao tác. Kết quả của nó không thay thế thực nghiệm với ảnh do học sinh chụp. Các ảnh vật thể trong phần chọn dữ liệu được tạo để minh họa tình huống, không phải kết quả thí nghiệm.

## Dữ liệu trên thiết bị

Không cần tài khoản, họ tên hoặc API key. Ảnh được đọc và xử lý trong bộ nhớ của trình duyệt, không được tải lên máy chủ. Tải lại trang sẽ mất ảnh, bộ kiểm tra và mô hình. Nhật ký, kết luận và trạng thái hoàn thành thử thách được lưu trong localStorage; có nút xóa nhật ký và tải báo cáo. Không lưu ảnh vào localStorage.

Trên iPad dùng Safari. Nếu nút Chụp ảnh không mở camera, chụp bằng ứng dụng Camera rồi thêm từ thư viện. Đã kiểm tra bằng trình duyệt và kích thước màn hình mô phỏng; camera trên iPad vật lý cần được giáo viên thử trước giờ học.

## Chạy và triển khai

HTML/CSS/JavaScript thuần, không cần cài gói hoặc backend. Chạy một HTTP server trong thư mục này để xem trước. GitHub Pages phục vụ nhánh `main` từ thư mục gốc, với `.nojekyll`.

Các khóa nhật ký `datalab-rounds` và `datalab-conclusion` được giữ tương thích với phiên bản trước.
