---
title: DUALITY TEST WRITEUP
date: 2026-26-04
author: deroise2306
---

# Plum
Như tên bài thì file được cho là một file `plum.sqlite`, là một file database của StickyNote Windows. Mở bằng DB Browser:
![{95680F15-3DCC-40E4-9BF9-18AB0A835235}](https://hackmd.io/_uploads/Hyv_AfjTWe.png)
![{987DB66D-EA49-44D0-B6AC-8A6F1B997AC6}](https://hackmd.io/_uploads/S1HKRfjpZx.png)
![{19BF8D06-14F1-4C3B-AC79-F2C319263725}](https://hackmd.io/_uploads/SkW5CMsTWe.png)
Nhìn chung thì ta sẽ chủ yếu để ý đến 7 ID của 7 note kia thôi :/
Bài này theo như Description và đọc các blog về Stickey Note trên mạng thì đinh ninh 69,96% là tìm cách recover các note bị xoá hoặc bị ẩn. Vì thế soi hẳn bằng HxD xem thu hoạch được gì không. Để ý thì ID của các đối tượng sẽ luôn theo format là `{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx}` nên cũng rất dễ spot out:
![{4153F9CC-6412-48BE-9B77-BE65BF816CD6}](https://hackmd.io/_uploads/B1GvJ7jTbe.png)
Khối này thì có vẻ là các Note ta thấy ở Database.
![{EBC5D063-B5FA-4AEC-ACA4-AA8D600C3739}](https://hackmd.io/_uploads/BJRi1mjpbe.png)
Có khối này nhìn rất lạ, ID cũng ở trong khối, nhìn thì trông có vẻ bị làm rối hoặc mã hoá gì đó:
![{3E949F58-FD64-489E-924E-6B5F894D211A}](https://hackmd.io/_uploads/BkIoQmoabx.png)
Đoạn này thì ta thấy các ID lạ hoàn toàn không có trong table. `{71da4b2e-128e-42b4-91c1-c8d548785c78}` và`{342d3b29-5390-4e32-8310-d070f92191f5}`.
Đến đoạn này thì dù biết là chính nó nhưng không có hint gì nên quyết định là gemini thử:
![{7BAE1CEF-4644-4EC2-B58F-A23E8FF747A1}](https://hackmd.io/_uploads/rkgLQXipWe.png)
Dùng script để gỡ rối:
```
raw = data[id_end:]
text_bytes = [b ^ 0xCC for b in raw if b != 0xCC]
decoded = bytes(text_bytes).decode('utf-8', errors='replace')
```
Out:
```
[INTERNAL - confidential]
Prod vault recovery - procedure v3.2 (SOP §4.2)
Session token:
  Sk-Qn7V-mZ8k-LpR9-xNfT-YwE4-2024-prod-vault-key-master-offline-v2
Kit: backup_shard_20240301.dat (per SOP §4.2, protected at-rest).
Token is single-use. Valid 1 hour. Rotate immediately.
DELETE THIS NOTE before handing the laptop over.
```
Ở đây ta có session token: `Sk-Qn7V-mZ8k-LpR9-xNfT-YwE4-2024-prod-vault-key-master-offline-v2`, tên kit `backup_shard_20240301.dat` cũng xuất hiện ở block data lạ kia. Đem xor với trường data sau đoạn `application/octet-stream` thì ta có được một file với header PNG:
![flag](https://hackmd.io/_uploads/r18lHmsTWx.png)

# GOODBYE
Bài cho một file pcap, tất cả đều có điểm chung là gói tin đều là ICMP và phần data đều là 1200byte. 
![{53C9F4A6-0306-4769-BF06-D973B7E1B57E}](https://hackmd.io/_uploads/SJLexEsp-g.png)
Lướt đến packet cuối thì ta nhận thấy có 2 dấu =, khả năng cao là encode B64 nên viết script trích xuất thì nhận được một file khá lớn. Đem đi decode thì thấy được header rất quen thuộc:
![{E2001E46-9ECE-412F-8233-5EF4CB1FECAB}](https://hackmd.io/_uploads/B1u4eEiaWx.png)
Ok, lưu về dạng file RAR nhưng bị khoá mật khẩu, Crack bằng john thì ta được mật khẩu sẽ là `123`, giải nén ra sẽ được một file PNG nặng gần 30mb khá sú:
Binwalk thì thấy có giấu gì đó khả nghi bên trong:
![image](https://hackmd.io/_uploads/HyPkdNsTbe.png)

```
┌──(deroise2306㉿DESKTOP-M8CGFUM)-[/mnt/c/Users/deroise2306/Downloads/misc/misc]
└─$ binwalk IMG.png

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 661 x 512, 8-bit/color RGBA, non-interlaced
91            0x5B            Zlib compressed data, compressed
191424        0x2EBC0         RIFF audio data (WAV), PCM, 2 channels, 48000 sample rate
2662131       0x289EF3        JBOOT STAG header, image id: 7, timestamp 0x9D24BB06, image size: 1076192264 bytes, image JBOOT checksum: 0x8C0B, header JBOOT checksum: 0xFD25
7190697       0x6DB8A9        MySQL ISAM index file Version 10
7384999       0x70AFA7        MySQL ISAM index file Version 4
8674576       0x845D10        JBOOT STAG header, image id: 12, timestamp 0x2E350F11, image size: 820515764 bytes, image JBOOT checksum: 0x197D, header JBOOT checksum: 0x3311
17882524      0x110DD9C       MySQL MISAM compressed data file Version 1
18337827      0x117D023       JBOOT STAG header, image id: 3, timestamp 0x2721C703, image size: 337576703 bytes, image JBOOT checksum: 0xEEFB, header JBOOT checksum: 0xD91B
19267381      0x125FF35       JBOOT STAG header, image id: 0, timestamp 0x26233705, image size: 102912257 bytes, image JBOOT checksum: 0x13FD, header JBOOT checksum: 0x9B20
21964242      0x14F25D2       MySQL ISAM index file Version 6
27429909      0x1A28C15       JBOOT STAG header, image id: 7, timestamp 0xA222FF0D, image size: 1361199881 bytes, image JBOOT checksum: 0x7C04, header JBOOT checksum: 0x6B21
```
Rõ ràng là thấy một file RIFF Audio, chắc chắn là file âm thanh rồi thì ta trích xuất ra:
![{E7C3F00F-1341-4053-9384-9E036B3E6E7F}](https://hackmd.io/_uploads/Hk4dRG2JMl.png)
Sau một thời gian nghiên cứu thì thử với DeepSound:
![{55C0095F-BD32-49EC-A64B-D078678272F8}](https://hackmd.io/_uploads/BymiCGnkzg.png)
Đúng như dự kiến, file đòi hỏi mật khẩu. Sử dụng mật khẩu như ở trong ảnh:
![{BC006434-C681-4481-8D6C-27A278D090AE}](https://hackmd.io/_uploads/r18TAf2kMx.png)
Tải file SPAM.txt này về:
![{47F0AFB1-32E2-49D4-8A04-858FACCA008A}](https://hackmd.io/_uploads/rJYlyX3kGg.png)
File này ban đầu có vẻ là không có gì, nhưng thực chất được mã hoá bởi Spam Mimic. Giải mã ra thì được một nội dung có vẻ là cũng được mã hoá khác:
![{00E4FC77-5D68-4441-88E5-6AACD8E74822}](https://hackmd.io/_uploads/B11IyQ2yzx.png)
Đây là Chess Steganography, giải mã thì ta có được flag:
![{EC2DDD93-DAB1-4712-B776-1E56C758247C}](https://hackmd.io/_uploads/H1Hebmh1Gg.png)

# macoveros
Cang det
Ban đầu khi loat file máy ảo vào thì ta có thể thấy một vấn đề: máy bị boot loop.
Để xử lí vấn đề này thì ta có thể sử dụng [cái này](https://github.com/paolo-projects/auto-unlocker):
![{11B683E3-97F8-4168-8A63-14A4248FD315}](https://hackmd.io/_uploads/rkcB34oabg.png)
Khi boot vào thì gặp mật khẩu, nhưng hint thì ở ngay màn hình khoá rùi:
![{42275C41-69F6-4F26-A2CB-9AF4999D29BA}](https://hackmd.io/_uploads/rJ332Nsa-g.png)
Decode đoạn trên ra thì sẽ có mật khẩu `KcScx1337`
Khi log vào thì bùm, một đống file bị mã hoá `.enc`. Tuy nhiên thì duy nhất có 1 file pcap vẫn còn đọc được và có lẽ đây là clue duy nhất để phân tích. 
![Capture](https://hackmd.io/_uploads/ByR26Vs6-x.jpg)
Mở file Wireshark và xem xét, nhận thấy các gói TCP khả nghi:
![{002086D8-FA82-4258-B839-E010E5604B05}](https://hackmd.io/_uploads/HyaGA4o6bx.png)
Follow Stream thì ta thấy rõ ràng đây có thể là các request thực hiện yêu cầu mã hoá các file:
![{935693EA-9271-408E-BA6B-E26413D599AF}](https://hackmd.io/_uploads/Sk3C1rsT-g.png)
Thấy được các tham số `victim_id`, `machine_info`, các thông tin liên quan,...Sau đó là tên các file trong máy (cả tên trước và sau mã hoá, cùng đường dẫn), đặc biệt kèm đó là cả `aes_key`.
Ngoài ra còn có một request HTTPS được gửi về `14.225.220.66:5026`, có vẻ như là địa chỉ máy của attacker nhằm report về trạng thái mã hoá.
Flow có thể là như sau: Khi mã độc thực thi, nó thực hiện quét tất cả các file, mã hoá dạng `.enc` với tên ngẫu nhiên. Sau khi hoàn thành mã hoá thì gửi report về địa chỉ `14.225.220.66:5026`.
Để ý một chút thì có vẻ là file thực thi là một file python, vậy khả năng cao là một mal được viết bằng python.
![{1EFC6FC7-8BF3-447E-A56F-98B47C6F0E3B}](https://hackmd.io/_uploads/SyKH4riaZl.png)
Tìm trong report thì ta tìm được duy nhất file `a.py` này:
![{596A80CF-A4AB-47BC-B7F9-E06BB5985CC3}](https://hackmd.io/_uploads/rJwcNBoa-l.png)
Có vẻ như là bản thân file mal cũng đã mã hoá nó thành `kplhwold2424.enc` . Để ý một chút thì cảm giác có vẻ như là các key chính là 10 số đầu của tham số `Creation_Time`. Nhưng nếu mã hoá AES thì key phải có độ dài 16 hoặc 32 gì đó, chứ không phải 10 :').
Quay sang kiểm tra lịch sử command, có vẻ như trò chơi mà đề bài đề cập chính là trò chơi này, cũng chính là malware mà ta đề cập:
![{D1A95A8B-70FE-4D33-9C25-4111B3783EF6}](https://hackmd.io/_uploads/BJ1Xk8oaWe.png)
File trò chơi vốn gốc ở thư mục `Downloads` này cũng đã bị mã hoá:
![{AFE3019A-A342-400B-A3D7-62D8B64BCCD2}](https://hackmd.io/_uploads/S1OoxIjTbg.png)
Nhưng không sao, sau giải thì em D đã thấy link Download nó ở ngay trong Safari:
![{FED549AF-D9C5-45F8-87F0-32291D6A3409}](https://hackmd.io/_uploads/SksBkWWC-l.png)
Tải file bin về và nhờ GPT Reverse: 
```
Bước 1: Chuẩn bị khóa (Key Derivation)
   * Malware lấy thời gian tạo tệp (st_birthtime) của tệp gốc.
   * Nó chuyển phần nguyên của thời gian này thành một mảng 8 byte theo định dạng Little-endian.
   * Mảng này được đệm thêm 8 byte 0x00 vào cuối (phép ljust(16, b"\x00")) để tạo thành một khóa 16 byte hoàn chỉnh cho AES.

  Bước 2: Lớp _l1 (Initial XOR Masking)
   * Dữ liệu gốc được XOR với một chuỗi lặp lại của b"x" * 36.
   * Mục đích: Phá vỡ cấu trúc định dạng file (Magic bytes) ngay từ đầu.

  Bước 3: Lớp _l2 (Stream Cipher)
   * Dữ liệu từ bước 2 được mã hóa bằng thuật toán ARC4.
   * Khóa (Key) được sử dụng là chuỗi cứng: b"KCSC".

  Bước 4: Lớp _l3 (Sequence Rotation)
   * Malware thực hiện xoay vòng mảng byte sang trái 47 vị trí.
   * Phép xoay này được lặp lại 36 lần.
   * Lưu ý: Nếu kích thước tệp nhỏ hơn 47 byte (như tệp Report.txt 28 byte), phép xoay data[47:] + data[:47] sẽ không thay đổi dữ liệu.

  Bước 5: Lớp _l4 (Block Cipher - AES)
   * Sử dụng thuật toán AES-CBC.
   * Key: Là khóa 16 byte tạo ra từ Bước 1.
   * IV: Là 16 byte rỗng (b"\x00" * 16).
   * Padding: Dữ liệu được đệm thêm các byte 0x00 để chia hết cho 16 byte (Block size của AES).

  Bước 6: Lớp _l5 (Final XOR Masking)
   * Dữ liệu sau AES được XOR một lần cuối với chuỗi Tên tệp gốc (ví dụ: Report.txt) lặp lại liên tục.
   * Kết quả cuối cùng được ghi ra tệp .enc.
```
Kết hợp với Payload report trước đó, ta có thể xác định được các file nên giải mã. Tạm có thể đoán được là các file flag thường là các file txt hoặc bin thì ta có được 2 file: "Report.txt" và "Something.bin". 
Sử dụng script sau để giải mã:
```python=
from Crypto.Cipher import AES, ARC4

def decrypt_file(encrypted_data, original_name, birthtime_int, original_size):
    mask = original_name.encode()
    stream = (mask * ((len(encrypted_data) // len(mask)) + 1))[:len(encrypted_data)]
    data = bytes(a ^ b for a, b in zip(encrypted_data, stream))
    
    key = birthtime_int.to_bytes(8, "little").ljust(16, b"\x00")
    cipher = AES.new(key, AES.MODE_CBC, iv=b"\x00" * 16)
    data = cipher.decrypt(data)
    data = data[:original_size]
    rot = 47
    cycles = 36
    for _ in range(cycles):
        data = data[-rot:] + data[:-rot]

    data = ARC4.new(b"KCSC").encrypt(data)
    
    k2 = b"x" * 36
    stream_l1 = (k2 * ((len(data) // len(k2)) + 1))[:len(data)]
    data = bytes(a ^ b for a, b in zip(data, stream_l1))
    
    return data

if __name__ == "__main__":
    enc_file = "ylwhdpcf8348.enc"
    orig_name = "Report.txt"
    birthtime = 1762945782
    orig_size = 28

    try:
        with open(enc_file, "rb") as f:
            encrypted_content = f.read()
        
        result = decrypt_file(encrypted_content, orig_name, birthtime, orig_size)
        print("--- Giai ma thanh cong ---")
        print(f"Noi dung: {result.decode('utf-8')}")
    except Exception as e:
        print(f"Loi: {e}")
```
Ở file txt, ta thu về được string `4n6_1nv3stigat0r_dOesn’7_`.
Còn file bin thì phức tạp hơn một chút khi mà dạng file không trực tiếp ra flag với các con số ví dụ như là `30 31 31 30 31 31 30 30 20 30 31 31 30 31 30 30 31 20 30 31 31 30 31 30 31 31 20 30 30 31 31 30 30 31 31 20 30 31 30 31 31 31 31 31 20 30 30 31 31 30 31 31 31 20 30 31 31 30 31 30 30 30 20 30 31 31 30 31 30 30 31 20 30 31 31 31 30 30 31 31 20 30 31 30 31 31 31 31 31 20 30 31 31 30 31 30 30 30 20 30 31 31 31 30 31 30 31 20 30 31 31 30 31 30 30 30 20 30 30 31 30 30 30 30...`. So vào bảng ASCII thì ta có thể thấy rằng: 30 chính là `0`, 31 chính là kí tự `1`, còn 20 là dấu cách. Viết script để giải mã thì ta được string `lik3_7his_huh!?:C}`. 
Flag gồm 3 mảnh, vì thế còn 1 mảnh nữa. :))) bằng 1 cách nào đó thì sau khi giải mã tất cả các file screenshot thì ta có một file với mã QR:
![Screenshot_decrypted](https://hackmd.io/_uploads/H1jx17ZCWx.png)
Text trong QR chính là `KCSC{w1ndOw5_d1git4l_`. 
Ghép lại ta có flag hoàn chỉnh: `KCSC{w1ndOw5_d1git4l_4n6_1nv3stigat0r_dOesn’7_lik3_7his_huh!?:C}`
>Credit: cảm ơn sự support cực kì nhiệt tình của Quang và author fr4nk đã giúp em D hoàn thiện bài này ạ! ||Va nun na na na anh Codex da reverse lai giup em con malware||
