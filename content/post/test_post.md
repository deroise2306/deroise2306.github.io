---
title: 'Test'

date: 2026-02-26
---
# 1. File System:
### a. Kiến trúc NTFS:
**New Technology File System** là một công nghệ tổ chức hệ thống file cho hệ điều hành Windows ~~(đhs tên nghe fancy vkl)~~. Công nghệ này đem lại những tính năng nâng cao với khả năng tổ chức, sắp xếp vào bảo mật tốt, được sử dụng hiệu quả trong quản lí và tổ chức dữ liệu.
- MFT (Master File Table): một thành phần quan trọng của hệ thống NTFS, được coi là sổ cái của NTFS, lưu trữ toàn bộ thông tin về hệ thống địa chỉ các tập tin trong hệ thống file. Mỗi mục MFT chiếm đúng 1Kb. Nhờ có MFT giúp cho việc quản lí, truy cập các tệp tin diễn ra nhanh và hiệu quả hơn. 
Minh hoạ về file MFT:
![image](https://hackmd.io/_uploads/S1IRiFmvWg.png)
Cấu trúc của một bản ghi MFT (MFT Record) như sau:
![image](https://hackmd.io/_uploads/SJ9yy9QD-e.png)
Vậy còn $MFT? Đây là một tập tin hệ thống lưu trữ bảng tệp. Mỗi máy tính sẽ có một file $MFT, và mỗi file này sẽ gồm nhiều MFT Record. Là một tệp tin hệ thống, tuy nhiên việc xem file này yêu cầu sử dụng FTK Imager hoặc một số phần mềm chuyên dụng khác.
![image](https://hackmd.io/_uploads/B1pyDc7wbe.png)
*Thử mở file $MFT trên FTK Imager*
![image](https://hackmd.io/_uploads/Sk_ruTHv-e.png)
*Một file $MFT được parse bằng MFTECmd*
- $LogFile: File này chịu trách nhiệm ghi lại tất cả những gì đã xảy ra với trong hệ thống NTFS. Hiểu nôm na tất cả các việc như là tạo mới, chỉnh sửa, di chuyển, xoá file đều được ghi lại ở $LogFile. Điều đặc biệt ở $LogFile là cơ chế "Write ahead logging" khi mà mọi thay đổi đều được ghi vào file Log này trước khi được thực thi ở hệ thống.
- $UsnJrnl (Updated Sequence Number Journal): tương tự như các file ở trên, đây cũng là một file gắn với hệ thống NTFS ở Windows, cũng là các bản ghi lại sự thay đổi của các file trong hệ thống. 

>Điểm khác biệt ở chỗ: các bản ghi của $LogFile ở mức low-level nhằm đảm bảo sự nhất quán của hệ thống file. Trước khi thực hiện chỉnh sửa ở $MFT thì hệ thống sẽ ghi nhận một log thay đổi trước ở file $LogFile (redo record), trong khi đó thì $UsnJrnl thực hiện ghi chép các high-level change ở tệp tin hay thư mục thường được sử dụng cho các ứng dụng thay vì hệ thống như $LogFile. Hơn nữa, bản ghi $UsrJrnl thường chi tiết hơn (chứa nhiều thông tin như là lí do thay đổi, timestamp, ...) trong khi $LogFile có các record với cấu trúc đơn giản hơn nhiều, đánh dấu thứ tự bằng LSNs.

### b. ADS (Alternate Data Stream)
Là một cách để có thể che dấu dữ liệu text trong file bằng việc sử dụng stream, điều đặc biệt là hầu như không làm thay đổi quá nhiều đến dung lượng file. Sử dụng ADS cho phép người ta giấu một thông tin gì đó dưới tên 1 file bất kì, chỉ có thể truy cập thông tin qua một khoá chính là tên của stream đó. Và phương pháp này chỉ hiệu quả và khả dụng trên các phân vùng ổ cứng định dạng NTFS. 
Ví dụ, em D có một file test như sau:
![image](https://hackmd.io/_uploads/r10cp7LP-e.png)

Em D sẽ thực hiện nhúng một đoạn thông điệp gì đó vào file này:
![image](https://hackmd.io/_uploads/H19S0mUv-x.png)
Một cửa sổ hiện lên cho em Dũng nhập message:
![image](https://hackmd.io/_uploads/H1ImAX8w-x.png)

Trước khi nhúng và sau khi nhúng thì nội dung file và dung lượng không hề thay đổi. Để xem nội dung luồng em D đã nhúng, nhập ngay:
![image](https://hackmd.io/_uploads/rJ5ChQUDZl.png)
Và cửa sổ Notepad sẽ mở lại. Ngoài ra để xem lại mấy cái stream em D đã tạo có thể sử dụng `dir /r`:
![image](https://hackmd.io/_uploads/rkanCQLDZl.png)
Ngoài ra cũng có thể thực hiện nhúng file, không chỉ là text với command `type`.
### c. Timestamp MACB:
MACB gồm các sự kiện: Modified, Accessed, Changed, Birth (Created). Timestamp MACB chính là các mốc thời gian mà các hành động trên xảy ra được ghi lại trong các file log của hệ thống NTFS. Các timestamp này trong hệ thống NTFS của mỗi file được lưu trữ ở các vị trí `$STANDARD_INFORMATION` hoặc `$FILE_NAME`. Dựa vào các timestamp MACB này giúp ta xác định được nguồn gốc file, các mốc thời gian file bị tác động hay các yếu tố đáng ngờ khác.
Về quy luật thay đổi thời gian khi thực hiện tác động lên file, thì ta cần hiểu về sự thay đổi các mốc thời gian của 4 yếu tố MACB:
- Với trường hợp copy dù là cùng phân vùng hay khác phân vùng, việc này là tạo ra một file mới hoàn toàn so với file gốc. Các thuộc tính MC được kế thừa từ file gốc, còn các thuộc tính AB sẽ được tạo mới với mốc mới chính là thời điểm thực hiện thao tác copy file. ![image](https://hackmd.io/_uploads/B12RfEIDZg.png)
- Với trường hợp move, thì ta cần phân ra làm 2 trường hợp nhỏ hơn là move cùng phân vùng và move tới khác phân vùng. Nếu cùng phân vùng, thì chỉ có mốc C bị thay đổi còn các thuộc tính khác giữ nguyên, trong khi nếu là move đến khác phân vùng thì mốc AC sẽ đều được cập nhật.![image](https://hackmd.io/_uploads/SJfjm4IDbl.png)

Trong CTF thì việc phát hiện Timestomping là rất quan trọng để xác định hành vi nguỵ tạo xác định các file nghi ngờ. Có 4 cách để xác định hành vi nguỵ tạo:
- So sánh `$SI` và `$FN` ở `{$MFT}` : bởi lẽ timestamp ở `$FN` hầu như không thể thay đổi được do khó bị user thay đổi.
- Số thứ tự bản ghi MFT
- Log UsrJrnl
- Độ chính xác ở mốc thời gian: chẵn quá thì sú

Check it out [here](https://artefacts.help/windows_macb_timestamps.html).

# 2. System Hives & Registry:
Trước tiên cần hiểu một chút về Windows Registry và Hives là gì. Hiểu đơn giản thì Windows Registry chính là một bộ các thông số cài đặt cho hệ điều hành, dùng để lưu trữ các phần thông số, tham số để cho hệ điều hành hoạt động chính xác như mong muốn, được lập ra giúp các users có thể dễ dàng quản lí và chỉnh sửa các thông số cấu hình theo nhu cầu và mong muốn. Hệ thống Windows Registry sẽ giống như một cái cây, có các thành phần gồm Hives, Keys và Values. Có thể nhìn để hiểu như ở hình dưới đây:
![image](https://hackmd.io/_uploads/HySbvNLv-l.png)
Nói về System Hives, thì ta phân biệt nó với User Hives bằng việc là một cái để lưu thiết lập hệ thống, một cái để lưu thiết lập người dùng.
Đi chi tiết các hives `SAM`, `SYSTEM`, `SOFTWARE`, `NTUSER.DAT`, `USRCLASS.DAT` thì tất cả các hives này đều có thể tìm thấy chúng ở địa chỉ `C:/Windows/System32/Config`:
![image](https://hackmd.io/_uploads/H1hytVUD-g.png)
Các thông tin mà mỗi file này lưu trữ sẽ tương ứng như sau:
|Tên|Đường dẫn|Nội dung|
|:----|:--|:---------|
|SYSTEM|\SYSTEM|Cấu hình hệ thống, dịch vụ (services), múi giờ, tên máy, driver.|
|SOFTWARE|\SOFTWARE|Thông tin Windows, phần mềm bên thứ 3, danh sách mạng Wifi.|
|SAM|\SAM |Danh sách người dùng local, nhóm, và các hash mật khẩu.|
|NTUSER.DAT|\Users\<User>\NTUSER.DAT|Lịch sử tìm kiếm, file vừa mở, tùy chỉnh cá nhân của người dùng đó.|
|USRCLASS.DAT|\Users\<User>\AppData\Local\Microsoft\Windows\UsrClass.dat|Chủ yếu là shell settings và mapping.|

*check it [here](https://www.cybertriage.com/blog/windows-registry-forensics-cheat-sheet-2025/)*

Mở trực tiếp thì không được nên mình sẽ dùng công cụ là Registry Explorer để xem thử nha:
![image](https://hackmd.io/_uploads/Bk4QidPwbg.png)
*Thử load một file SAM vào xem thử*
Ngoài ra cũng có thể xem trực tiếp trên trình Registry Editor của Windows:
![image](https://hackmd.io/_uploads/HyKjXKwwZx.png)
Ngoài ra có thể sử dụng RECmd là một CLI Application thay vì GUI Application như Reigstry Explorer.

Để biết các thông tin về hệ thống thì ta có các địa chỉ sau:
- Hostname: `\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\ComputerName\ActiveComputerName`
![image](https://hackmd.io/_uploads/BJNRStvPbe.png)
- OS Version: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion`
![image](https://hackmd.io/_uploads/BkUQLKPPZl.png)
- Timezone: `\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation`
![image](https://hackmd.io/_uploads/SyBVvtvPWl.png)

Ngoài ra, danh sách các mạng Wifi đã kết nối cũng được lưu trong các Registry Key tại địa chỉ: `\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkList\Profiles\`
![image](https://hackmd.io/_uploads/HyZAvtDPZg.png)
Mỗi Profile tương ứng với 1 mạng đã từng kết nối:
![image](https://hackmd.io/_uploads/H1MbutwPWg.png)
Cùng với đó thì danh sách các địa chỉ IP tĩnh và động có thể được xem tại: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces`
![image](https://hackmd.io/_uploads/SksdOtwDWl.png)

# 3. Evidence of Execution:
- **Prefetch**: xuất hiện từ Windows XP, thì việc tạo ra Prefetch với mục tiêu chính là tăng tốc cho quá trình khởi động hay khởi chạy ứng dụng bằng cách lưu một số tệp cần thiết của các chương trình để tiết kiệm thời gian load. Có thể truy cập vào folder chứa các file này tại địa chỉ `C:\Windows\Prefetch` hoặc Win + R -> prefetch: 
![image](https://hackmd.io/_uploads/rJQsa5ddbe.png)
Muốn parse file pf thì ta có thể sử dụng PECmd: 
![image](https://hackmd.io/_uploads/HJEQkodubx.png)
Trích xuất được đầy đủ các thông tin của một file .pf. Có thể thấy file này giống như là một cuốn danh bạ, mỗi khi khởi chạy ứng dụng (Ví dụ như trong hình là Premiere Pro) sẽ load các file tương ứng được ghi trong file -> tiết kiệm thời gian. 
Ngoài ra cũng có thể trích xuất ra file csv:
![image](https://hackmd.io/_uploads/H1iiki__-g.png)
![image](https://hackmd.io/_uploads/BJDzlsdubx.png)
*File Output 34Kb, chủ yếu lưu những tệp yêu cầu*
![image](https://hackmd.io/_uploads/H16axsdd-l.png)
*File Timeline, lưu lại các timestamp khởi chạy ứng dụng*
- **ShimCache (Application Compatibility Cache)**: như tên gọi thì có thể hiểu là các file giúp duy trì tính tương thích của ứng dụng. Có thể tìm thấy file này ở đường dẫn `\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache` trong Windows Registry.
![image](https://hackmd.io/_uploads/H1sGy3ud-x.png)
Ở một số phiên bản Windows cổ đại thì tên sẽ là `AppCompatibility` thay vì `AppCompatCache`.
Lí do cần để ý lưu tâm file này bởi lẽ ở đây lưu lại dấu vết về việc thực thi các file, các chương trình phục vụ cho việc điều tra, xây dựng timeline. 
Thử parse bằng AppCompatCacheParser: 
![image](https://hackmd.io/_uploads/ByggBnudZe.png)
*Command line*
![image](https://hackmd.io/_uploads/HJtfH3O_Wl.png)
*File output*
- **Amcache** (Application Activity Cache): ra đời sau so với Shimcache (cùng với Windows 7). Amcache lưu trữ dữ liệu về các file thực thi đã được khởi chạy hoặc tương tác với hệ thống. Là một phần của AppCompat (Application Compatibility Framework), giúp hệ thống chạy mượt mà hơn. 
![image](https://hackmd.io/_uploads/rkcwP15dZl.png)
Địa chỉ file Amcache: `C:\Windows\AppCompat\Programs\Amcache.hve`
Ngoài ra, AmCache lưu trữ thông tin về cả các file DLL được sử dụng trong hệ thống.
Cũng có thể parse file AmCache này bằng cách export bằng FTK rồi parse bằng Amcache Parser:
![image](https://hackmd.io/_uploads/S1zmA1cdbx.png)
Lượt đầu thì có vẻ không được thành công lắm do file hệ thống này có vẻ bị lỗi hoặc chưa được format chuẩn (chắc thế :)) Bằng một cách nào đó em D không export được file `Amcache.hve.LOG1` bằng FTK nên em D quyết định là parse no log  (thêm -nl) luôn cho mát, ra được các file:
![aaaaaaa](https://hackmd.io/_uploads/B1BwXx9_Wl.jpg)
Sample File mà em D cảm thấy nhiều giá trị khai thác nhất:
![image](https://hackmd.io/_uploads/HJJq7xqubl.png)
So sánh với file Shimcache thì có vẻ là nhiều thông tin hơn, chi tiết hơn. Điểm khác lớn nhất có lẽ là ta có thể khai thác nhiều thông tin hơn về các thiết bị ngoại vi đối với file Amcache. Một điều nữa, khi mà trong file Shimcache thì các file exe có giá trị `LastModifiedTime` nhưng trong file Amcache lại là `Linkdate` hay chính là thời gian mà file exe được cài vào trong máy => có sự khác biệt, phục vụ cho các mục đích điều tra khác nhau.

# 4. User Activity:
- **LNK Files**: chính là các file shortcuts được sử dụng trong Windows. Về bản chất thì file LNK trỏ về một file khác ở vị trí khác trong hệ thống, và khi dbl click vào một file LNK thì file được link với file LNK sẽ được thực thi. 
Ví dụ:
![image](https://hackmd.io/_uploads/HyDmuZc_bx.png) ![image](https://hackmd.io/_uploads/B1k2_Wc_Ze.png)
Điều tra file LNK có thể biết được path ban đầu hay sự tồn tại của một số file đã bị thay đổi, di chuyển hoặc bị xoá. 
![image](https://hackmd.io/_uploads/rJf1DRc_Wl.png)
![image](https://hackmd.io/_uploads/BylxPC5OZl.png)
Một số thông tin trích xuất được bằng LECmd. Cái mà chúng ta cần quan tâm có lẽ là path, các Date thu được trong file.
- **Jump Lists**: là thứ hiện lên như hình ảnh minh hoạ dưới đây:
![image](https://hackmd.io/_uploads/SknbKZqO-x.png)
Như ta có thể thấy, Jump Lists về bản chất có lẽ cũng có thể hiểu là list các shortcuts, có thể được người dùng define (`customDestinations-ms`) hoặc do hệ thống tự động tạo ra (`automaticDestinations-ms`). 
![image](https://hackmd.io/_uploads/SJhuEHoOWx.png)
*Bằng một cách nào đấy thì hai file này không hiện lên ở Windows Explorer của em D mà phải xem trên wsl, địa chỉ `C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations`*
![image](https://hackmd.io/_uploads/HkuLyIjOZl.png)
`AutomaticDestinations` là các [OLE Compound File ](https://forensics.wiki/ole_compound_file/) (chính là các file có extension `automaticDestinations-ms`) , có thể hiểu đơn giản là một tệp gồm nhiều LNK bên trong, có thể được parse ra. Trong các streams này có 2 loại: hex numbered stream và DestList stream. Các Hex Numbered Stream chính là các tệp LNK được nhúng vào, còn DestList stream thì mỗi file chỉ có duy nhất 1 stream, mỗi stream có header dài 32 bytes, chứa các thông tin: 
>Entry ID: ID 
MRU / MFU (Most Recently/Frequently Used): Tần suất truy cập và lần truy cập gần nhất
Đường dẫn (Path)
Trạng thái pin: có được pin hay không?
Hostname / MAC Address: Địa chỉ MAC của card mạng máy tính tại thời điểm bản ghi được tạo

![image](https://hackmd.io/_uploads/rkJvZUj_We.png)
`CustomDestinations` thì lại đơn giản hơn nhiều. Được tạo ra mỗi khi mà user thực hiện pin item lên taskbar hoặc start menu. Mặc dù cũng có thể coi là tập hợp các file LNK nhưng không có cấu trúc giống với bọn `AutomaticDestinations` ở trên mà lại là một dạng đơn giản hơn kiểu như là Sequential (kiểu xếp nối tiếp với nhau), không có mục lục DestList như ở file `AutomaticDestinations` nhưng có header chuẩn. Ngoài ra, sự khác nhau của 2 loại này còn ở chỗ: `AutomaticDestinations` được tạo bởi OS, còn `CustomDestinations` được chính chương trình tạo ra. Xem thêm các jumplist ID: https://forensics.wiki/list_of_jump_list_ids/
Parse các file này bằng JLECmd:
![image](https://hackmd.io/_uploads/rJOtBUjd-e.png)
>Một số thông tin khá giá trị sẽ là các date tạo, truy cập, tần suất truy cập (Interaction => Phân tích hành vi user)
- **Shellbags**: một set các registry keys sử dụng để ghi nhớ các hành vi hiển thị thư mục của user trong File Explorer: ví dụ như chỉnh size icon, chỉnh chế độ view,... đều được ghi lại trong shellbags. Cái này có giá trị pháp y bởi lẽ có thể điều tra được sự tồn tại của một thư mục, hoặc việc insert một thiết bị nhớ như USB. Cùng với đó thì shellbags cũng giúp tái tạo lại cây thư mục.
Vị trí của các shellbags thường thì sẽ ở các hives: `NTUSER.DAT` và `UsrClass.dat`. Tại hive **NTUSER** thường lưu trữ các dữ liệu về các Network Folder, trong khi ta sẽ thường quan tâm đến **UsrClass** nhiều hơn bởi tại đây thường lưu trữ về các ổ cục bộ và các thiết bị lưu trữ ngoại vi:
```
NTUSER.DAT\Software\Microsoft\Windows\Shell\BagMRU
NTUSER.DAT\Software\Microsoft\Windows\Shell\Bags
UsrClass.dat\Local Settings\Software\Microsoft\Windows\Shell\BagMRU
UsrClass.dat\Local Settings\Software\Microsoft\Windows\Shell\Bags
```
![image](https://hackmd.io/_uploads/Hk2QMPs_Wg.png)
Như các đường dẫn ở trên, ta thấy có 2 nhánh: `BagMRU` và `Bags`. Thường thì nhánh **BagMRU** sẽ lưu trữ các dữ liệu về cây thư mục, sự tồn tại của các thư mục trong quá khứ, trong khi nhánh **Bags** sẽ lưu trữ thông tin về các dữ liệu hiển thị (kiểu như kích thước cửa sổ, kiểu layout,...). Vì thứ có giá trị hơn chính là nhánh BagMRU nên ta sẽ đào sâu hơn cái này một chút. Đối với nhánh này thì ta có thể tìm được các thông số: ***Nodeslot*** (Cái này tham chiếu với giá trị bên nhánh `Bags` để điều chỉnh cách hiển thị), ***MRUListEx*** (một giá trị cho biết thứ tự truy cập gần nhất trong các thư mục con)
![image](https://hackmd.io/_uploads/Bki14DoOWe.png)
Có thể đọc thêm một [tài liệu](https://www.4n6k.com/2013/12/shellbags-forensics-addressing.html) cực kì chi tiết.
Parsing Shellbags có thể sử dụng CLI Tools hoặc GUI Tools cùng của Eric Zimmerman, nhưng trong bài này thì mình sẽ ưu tiên GUI nhìn cho trực quan:
![image](https://hackmd.io/_uploads/r1aKqvi_Ze.png)
Chứng minh cho sự cần thiết của việc điều tra Shellbags hay cũng chính là giá trị của việc này, thì mình có ví dụ như sau:
![image](https://hackmd.io/_uploads/B1-msPsubl.png)
Ở đây mình sử dụng chính folder Picture để minh hoạ thì có thể thấy rằng mặc dù folder `2026-01-02` đã bị xoá nhưng vẫn còn lưu lại trong Shellbags => chứng minh sự tồn tại của thư mục:
![image](https://hackmd.io/_uploads/rkAYswiuZe.png)
Ngoài ra thì cũng có những log lưu lại những thư mục trong thẻ nhớ từng được cắm vào laptop này (dù hiện tại đang không kết nối vào laptop):
![image](https://hackmd.io/_uploads/ry15nPod-e.png)
- **UserAssist**: lưu dữ liệu về các file thực thi bởi các users được lưu trong Windows Registry, cho biết User đã chạy những ứng dụng nào. Vị trí của Reg này sẽ là `NTUSER.dat/Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist`. Các dữ liệu bị má hoá ROT13, gồm những thông tin: Path, Run Count, LastExcuTime, FocusTime (cái này lưu lại thời gian focus):
![image](https://hackmd.io/_uploads/ryYbkOoubl.png)
Có một đống subkeys, nhưng 2 subkeys quan trọng nhất ta cần quan tâm sẽ là 2 subkeys `{CEBFF5CD‑ACE2‑4F4F‑9178‑9926F41749EA}`* (lưu lại dữ liệu về các file `.exe` đã được thực thi) và `{F4E57C4B‑2036‑45F0‑A9AB‑443BCFE33D9F}` (Các shortcuts đã được click).
Mặc dù bị mã hoá với ROT13 nhưng cũng không quá khó để xử lí bằng Registry Explorer:
![image](https://hackmd.io/_uploads/S11DguidWg.png)
*Thực hiện parse bằng Registry Explorer với subkey `{CEBFF5CD‑ACE2‑4F4F‑9178‑9926F41749EA}`*
Tuy nhiên, hạn chế của tính năng này chính là việc chỉ ghi nhận số liệu với các chương trình có GUI, khởi động qua click trên File Explorer chứ không ghi nhận với các chương trình chạy bằng cmd hay tự vận hành, các file hệ thống. 
# 5. Event Logs (EVTX) & PowerShell
Đối với loại file `.evtx`, đây là loại log file được tạo bởi Windows. 5 hạng mục gồm Application, Security, Setup, System, và Forwarded Events được lưu log, có thể xem được bằng Event Viewer trên Windows:
![image](https://hackmd.io/_uploads/ByzqfEndZe.png)
Địa chỉ lưu các file này ở `C:\Windows\system32\winevt\Logs`. Bên cạnh các file kể trên, trong thư mục này còn xuất hiện các file log được tạo bởi các phần mềm khác không phải Windows.
![image](https://hackmd.io/_uploads/H1LcdEh_Zx.png)
Ta sẽ tập trung phân tích các Log của Windows với 3 file quan trọng hơn cả: Security, System và Application.
Đối với file **Security** log, đây là file ghi lại các event liên quan đến xác thực (authentication) và quyền hạn, chính sách. Đối với file này, ta sẽ thường quan tâm đến các event liên quan đến đăng nhập, tiêu biểu là các eventID 4624 và 4625. 
:::info
Cụ thể, với EventID 4624: Các event thực hiện hành vi đăng nhập (Log On). Trong các event có ID này cũng chia ra làm các type khác nhau, tuỳ thuộc vào hình thức đăng nhập, cách thức đăng nhập,...
![image](https://hackmd.io/_uploads/B1R_Dd3dbl.png)
*Ví dụ về một event có ID 4624, ở đây là type 5 (hành vi đăng nhập được thực hiện bởi tiến trình trong Windows)*. Ngoài ra, ta có thể bắt gặp một số type khác, ví dụ như là type 2 (đăng nhập trực tiếp), type 10 (qua RDP),...
Còn đối với eventID 4625, trái ngược với 4624 có nghĩa là đăng nhập thất bại. 
![image](https://hackmd.io/_uploads/H17Ld_ndWe.png)
*Ví dụ về EventID 4625*
:::
Đối với file **System** Log, tại đây ghi lại các sự kiện của chính hệ điều hành cùng cách thành phần liên quan, trong đó bao gồm cả các lỗi liên quan đến service và drivers.
Trong file này thì ta sẽ chú ý đến 2 eventID: Id 7045 và ID 104:
:::info
Với EventID 7045, đây chính là sự kiện mà một service được cài đặt vào hệ thống. Từ các event này có thể biết được thời điểm, thời gian một số mã độc được cài đặt, hoặc một số cơ chế duy trì quyền truy cập bằng cách tạo Service mới.
![image](https://hackmd.io/_uploads/ByzLAd3dbe.png)
Còn EventID 104 sẽ được ghi lại khi Log file bị clear:
![image](https://hackmd.io/_uploads/BkFhfF2_Ze.png)
:::
Còn đối với **Application** Log, đây là nơi ghi lại các thông báo từ các third-party application. Tại đây có thể tìm được các trace về các phần mềm độc hại:
![image](https://hackmd.io/_uploads/ByvFEY2_We.png)
*Ví dụ về một log trong Application log*
Thử trích xuất bằng EvtxECmd vẫn của Eric Zimmerman, lọc trong log Security các eventid 4624:
![image](https://hackmd.io/_uploads/SyIU-c2OWg.png)
![image](https://hackmd.io/_uploads/BJpOb93_be.png)
File CSV này giúp khả năng lọc theo type, theo date, ngoài ra kết hợp với Timeline Explorer cũng giúp việc khai thác dữ liệu trực quan hơn.
**Avanced  Powershell Logging**: thường thì chỉ khi bật tính năng Advanced Logging mới ghi lại log chi tiết, mặc định thì sẽ chỉ ghi lại những thông tin cơ bản như là đã bật, sẵn sàng lắng nghe:
![image](https://hackmd.io/_uploads/Byc7L9hObe.png)
**RDP Logs**: trước tiên thì RDP chính là Remote Desktop Protocol, cho phép điều khiển máy tính cá nhân từ xa. Việc nắm bắt được các sự kiện liên quan đến RDP giúp hiểu rõ hơn về cuộc tấn công nếu attacker có thực hiện kết nối remote desktop.
Các trường hợp sinh log của kết nối RDP, vị trí ghi logs được tập hợp ở file dưới đây:
<iframe src="https://cdn.13cubed.com/downloads/rdp_flowchart.pdf" width="100%" height="800px"></iframe>

Em D nhận ra là chưa thực hiện RDP bao giờ mà cũng đang dùng Win Home nên không có logs :sob: để demo. Nên là em D xem tạm bên [này](https://www.youtube.com/watch?v=myzG11BP3Sk), lúc nào có sample thì làm lại sau ạ.