# 🪙 Solana Week 4: Associated Token Account (ATA) & SPL Tokens

Dự án Tuần 4 tập trung vào việc quản lý tài sản trên Solana thông qua hệ thống **SPL Token** và **Associated Token Accounts (ATA)**. Đây là nền tảng cốt lõi để xử lý các giao dịch Token một cách an toàn và tối ưu trên chuỗi khối Solana.

Dự án này đã được triển khai (Deploy) thành công trên mạng **Solana Devnet**.

## 🌐 Devnet Program Address

Bạn có thể kiểm tra trạng thái và lịch sử giao dịch của chương trình trực tiếp trên Solscan:

| Program | Program ID (Address) | Solscan Link |
| :--- | :--- | :--- |
| **Week 4 ATA** | `HRXZ6hRnuNKnkMi2yZuKeqSAUZYuQoXq9dS7csbgW9Hc` | [View on Solscan](https://solscan.io/account/HRXZ6hRnuNKnkMi2yZuKeqSAUZYuQoXq9dS7csbgW9Hc?cluster=devnet) |

## 🌟 Kiến thức trọng tâm

Trong tuần này, dự án đã thực hiện và làm chủ các kỹ thuật:

- **Associated Token Account (ATA):** Hiểu và áp dụng cơ chế tạo tài khoản phụ dành riêng cho từng loại Token dựa trên địa chỉ ví chính.
- **SPL Token Program:** Tương tác trực tiếp với Token Program của Solana để thực hiện các hành động `Transfer`, `MintTo`, và `Burn`.
- **Instruction Data:** Cách xây dựng các Instruction để chuyển đổi Token giữa các ví cá nhân.
- **Anchor SPL Crate:** Sử dụng thư viện `anchor_spl` để đơn giản hóa việc quản lý tài khoản Token và kiểm tra tính hợp lệ của ATA.

## 🚀 Hướng dẫn khởi chạy (Devnet)

### 1. Cấu hình môi trường
Đảm bảo Solana CLI đang trỏ tới Devnet:
```bash
solana config set --url devnet
