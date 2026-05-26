---
title: 'LA CTF 2025'

date: 2025-10-02
author: deroise2306
description: LA CTF 2025 Writeup
tags: ["crypto", "CTF"]
---

# 1. Big E
![image](https://hackmd.io/_uploads/S1jXVFPYJg.png)
Source:
```python=
from Crypto.Util.number import bytes_to_long, getPrime

flag = REDACTED

pt = bytes_to_long(flag)

p = getPrime(1024)
q = getPrime(1024)
n = p*q

e_1 = getPrime(16)
e_2 = getPrime(16)



ct_1 = pow(pt, e_1, n)
ct_2 = pow(pt, e_2, n)
print("ct_1 = ", ct_1)
print("ct_2 = ", ct_2)

print("e_1 = ", e_1)
print("e_2 = ", e_2)

print("n = ", n)

# ct_1 =  7003427993343973209633604223157797389179484683813683779456722118278438552981580821629201099609635249903171901413187274301782131604125932440261436398792561279923201353644665062240232628983398769617870021735462687213315384230009597811708620803976743966567909514341685037497925118142192131350408768935124431331080433697691313467918865993755818981120044023483948250730200785386337033076398494691789842346973681951019033860698847693411061368646250415931744527789768875833220281187219666909459057523372182679170829387933194504283746668835390769531217602348382915358689492117524129757929202594190396696326156951763154356777
# ct_2 =  2995334251818636287120912468673386461522795145344535560487265325864722413686091982727438605788851631192187299910519824438553287094479216297828199976116043039048528458879462591368580247044838727287694258607151549844079706204392479194688578102781851646467977751150658542264776551648799517340378173131694653270749425410071080383488918100565955153958793977478719703463115004497213753735577027928062856483316183232075922059366731900291340025009516177568909257605255717594938087543899066756942042664781424833498278544829618874970165660669400140113047048269742309745649848573501494088032718459018143817236079173978684104782
# e_1 =  49043
# e_2 =  60737
# n =  9162219874876832806204248523866163938680921861751582550947065673035037752546476053774362284605943422397285024205866696280912237827227700515353007344062472274717294484810421409217463791112287997964358655519896402380272695026012981743782564008035342746214988154836484419372449523768063368280069515180570625408254410932129769708259508451185553774810385066789146531683973766796965747310893648672657945403825359068647151094841570404979930542270681833162424933411724266687320976217446032292107871449464575533610369244978941764470549091443086646932177141081314452355708815370388814214178980532690792441231698974328523197187
```
## Phân tích:
Bài cho dữ kiện gồm 2 ct, 2 e tương ứng và n. Với những dữ kiện này thì nghĩ ngay đến `Common Modulus Attack`:
## Code:
```python=
import gmpy2
from Crypto.Util.number import *

ct_1 =  7003427993343973209633604223157797389179484683813683779456722118278438552981580821629201099609635249903171901413187274301782131604125932440261436398792561279923201353644665062240232628983398769617870021735462687213315384230009597811708620803976743966567909514341685037497925118142192131350408768935124431331080433697691313467918865993755818981120044023483948250730200785386337033076398494691789842346973681951019033860698847693411061368646250415931744527789768875833220281187219666909459057523372182679170829387933194504283746668835390769531217602348382915358689492117524129757929202594190396696326156951763154356777
ct_2 =  2995334251818636287120912468673386461522795145344535560487265325864722413686091982727438605788851631192187299910519824438553287094479216297828199976116043039048528458879462591368580247044838727287694258607151549844079706204392479194688578102781851646467977751150658542264776551648799517340378173131694653270749425410071080383488918100565955153958793977478719703463115004497213753735577027928062856483316183232075922059366731900291340025009516177568909257605255717594938087543899066756942042664781424833498278544829618874970165660669400140113047048269742309745649848573501494088032718459018143817236079173978684104782
e_1 =  49043
e_2 =  60737
n =  9162219874876832806204248523866163938680921861751582550947065673035037752546476053774362284605943422397285024205866696280912237827227700515353007344062472274717294484810421409217463791112287997964358655519896402380272695026012981743782564008035342746214988154836484419372449523768063368280069515180570625408254410932129769708259508451185553774810385066789146531683973766796965747310893648672657945403825359068647151094841570404979930542270681833162424933411724266687320976217446032292107871449464575533610369244978941764470549091443086646932177141081314452355708815370388814214178980532690792441231698974328523197187
#Common modulus attack algo
def egcd(a, b):
  if (a == 0):
    return (b, 0, 1)
  else:
    g, y, x = egcd(b % a, a)
    return (g, x - (b // a) * y, y)

def neg_pow(a, b, n):
	assert b < 0
	assert GCD(a, n) == 1
	res = int(gmpy2.invert(a, n))
	res = pow(res, b*(-1), n)
	return res

def common_modulus(e1, e2, n, c1, c2):
	g, a, b = egcd(e1, e2)
	if a < 0:
		c1 = neg_pow(c1, a, n)
	else:
		c1 = pow(c1, a, n)
	if b < 0:
		c2 = neg_pow(c2, b, n)
	else:
		c2 = pow(c2, b, n)
	ct = c1*c2 % n
	m = int(gmpy2.iroot(ct, g)[0])
	return long_to_bytes(m)
print(common_modulus(e_1,e_2,n,ct_1,ct_2))
```
Flag: `lactf{b1g_3_but_sm4ll_d!!!_part2_since_i_trolled}`
## 2. RSAaaS:
![image](https://hackmd.io/_uploads/r1LNrFDtkl.png)
Source:
```python=
#!/usr/local/bin/python3

from Crypto.Util.number import isPrime


def RSAaaS():
    try:
        print("Welcome to my RSA as a Service! ")
        print("Pass me two primes and I'll do the rest for you. ")
        print("Let's keep the primes at a 64 bit size, please. ")

        while True:
            p = input("Input p: ")
            q = input("Input q: ")
            try:
                p = int(p)
                q = int(q)
                assert isPrime(p)
                assert isPrime(q)
            except:
                print("Hm, looks like something's wrong with the primes you sent. ")
                print("Please try again. ")
                continue

            try:
                assert p != q
            except:
                print("You should probably make your primes different. ")
                continue

            try:
                assert (p > 2**63) and (p < 2**64)
                assert (q > 2**63) and (q < 2**64)
                break
            except:
                print("Please keep your primes in the requested size range. ")
                print("Please try again. ")
                continue

        n = p * q
        phi = (p - 1) * (q - 1)
        e = 65537
        d = pow(e, -1, phi)

        print("Alright! RSA is all set! ")
        while True:
            print("1. Encrypt 2. Decrypt 3. Exit ")
            choice = input("Pick an option: ")

            if choice == "1":
                msg = input("Input a message (as an int): ")
                try:
                    msg = int(msg)
                except:
                    print("Hm, looks like something's wrong with your message. ")
                    continue
                encrypted = pow(msg, e, n)
                print("Here's your ciphertext! ")
                print(encrypted)

            elif choice == "2":
                ct = input("Input a ciphertext (as an int): ")
                try:
                    ct = int(ct)
                except:
                    print("Hm, looks like something's wrong with your message. ")
                    continue
                decrypted = pow(ct, d, n)
                print("Here's your plaintext! ")
                print(decrypted)

            else:
                print("Thanks for using my service! ")
                print("Buh bye! ")
                break

    except Exception:
        print("Oh no! My service! Please don't give us a bad review! ")
        print("Here, have a complementary flag for your troubles. ")
        with open("flag.txt", "r") as f:
            print(f.read())


RSAaaS()
```
## Phân tích:
Trông source rất dài, rất chiến. Đọc toàn bộ code thì ta nhận ra đây là một chương trình mã hóa RSA cũng "khá" chặt chẽ. Để sever nhả flag thì ta cần tìm ra điểm chưa chặt chẽ trong thuật toán thì sever sẽ đưa flag cho ta ~~để bịt miệng khách hàng~~:
```
 except Exception:
        print("Oh no! My service! Please don't give us a bad review! ")
        print("Here, have a complementary flag for your troubles. ")
        with open("flag.txt", "r") as f:
            print(f.read())
```
Đọc ban đầu thấy thuật toán cũng được rào chắn rất cẩn thận, cho đến đoạn này:
```
n = p * q
phi = (p - 1) * (q - 1)
e = 65537
d = pow(e, -1, phi)
```
Thuật toán chưa tính đến trường hợp khóa d không thể tính được bằng biểu thức $d = e^{-1} \pmod{\varphi(n)}$ đề mà báo lỗi. Vì thế ta sẽ khai thác ở đoạn này, bằng cách tìm ra hai giá trị p và q thỏa mãn điều kiện:
* Có độ dài 64bit
* Là số nguyên tố
* $\gcd(e, \varphi(n)) \ne 1$ hay $e$ và $\varphi(n)$ không nguyên tố cùng nhau, hay nhanh nhất là để cho giá trị $\varphi(n) \mid e$. Vì $\varphi(n) = (p-1)(q-1)$ và $\varphi(n) \mid e$, tức là cả 2 giá trị $(p-1)$ và $(q-1)$ đều phải chia hết cho $e$.

Lập luận như vậy đã xong, ta bắt đầu viết thuật toán tìm ra 2 giá trị đó:
## Code:
```python=
from Crypto.Util.number import getPrime, GCD

e = 65537
bit_size = 64

def find_bad_prime():
    while True:
        p = getPrime(bit_size)  
        if (p - 1) % e == 0:  
            return p


p = find_bad_prime()
q = find_bad_prime()


while p == q:
    q = find_bad_prime()

print(f"p = {p}")
print(f"q = {q}")
```
Output:
```
p = 14067967822044345757
q = 15160969304594700317
```
Cho 2 output này vào chương trình: 
![Screenshot 2025-02-10 210648](https://hackmd.io/_uploads/H1BZ0FwFye.png)
Flag:`lactf{actually_though_whens_the_last_time_someone_checked_for_that}`
# 3. Extremely Convenient Breaker
![image](https://hackmd.io/_uploads/rkUeeTPtJx.png)

Source:
```python=
#!/usr/local/bin/python3

from Crypto.Cipher import AES
import os

key = os.urandom(16)
with open("flag.txt", "r") as f:
    flag = f.readline().strip()
cipher = AES.new(key, AES.MODE_ECB)

flag_enc = cipher.encrypt(flag.encode())
print("Here's the encrypted flag in hex: ")
print(flag_enc.hex())
print("Alright, lemme spin up my Extremely Convenient Breaker (trademark copyright all rights reserved). ")

while True:
    ecb = input("What ciphertext do you want me to break in an extremely convenient manner? Enter as hex: ")
    try:
        ecb = bytes.fromhex(ecb)
        if not len(ecb) == 64:
            print("Sorry, it's not *that* convenient. Make your ciphertext 64 bytes please. ")
        elif ecb == flag_enc:
            print("No, I'm not decrypting the flag. ")
        else:
            print(cipher.decrypt(ecb))
    except Exception:
        print("Uh something went wrong, please try again. ")
```
## Phân tích
Bài sử dụng mã hóa AES mode ECB, key được gen ngẫu nhiên mỗi lần chạy chương trình. Là chương trình mã hóa thông thường, mỗi lần kết nối thì sever sẽ trả về flag được mã hóa, cho phép nhập vào một chuỗi để chương trình giải mã chuỗi 64 bytes theo key được gen lúc đầu. Nếu nhập vào đó flag ban đầu thì sever sẽ từ chối giải mã.
Vì là mode ECB, các block được mã hóa riêng biệt, lại có chương trình giải mã nữa. Với độ dài 64bytes, thì pt sẽ được chia làm 4 blocks. Lợi dụng việc 4 block được mã hóa và giải mã độc lập, ta có thể chia chuỗi `ct` thành 4 phần có độ dài bằng nhau, rồi tạo 4 chuỗi mới bằng cách lặp lại 4 lần các chuỗi vừa tách được và gửi lên sever. Vì sever giải mã theo từng block độc lập, nên sau mỗi lần gửi lên ta sẽ nhận về 1/4 flag.
## Exploit:
Bài không nhất thiết phải code full script vì chỉ cần chia chuỗi thành 4 phần, copy, lặp lại 4 lần rồi gửi đi nên mình sẽ chỉ code phần tách chuỗi:
```python=
def split_string(input_string):
    part_size = len(input_string) // 4  
    parts = [input_string[i:i + part_size] for i in range(0, len(input_string), part_size)]
    return parts

input_string = input()
parts = split_string(input_string)

for i, part in enumerate(parts, 1):
    print(f"Phần {i}: {part}")
```
Sever hơi đần, nên mỗi lần netcat thì chỉ gửi được 1 string rồi sập (ếu hiểu tại sao). Mình netcat 4 lần, nhận về 4 part của flag:
![Screenshot 2025-02-11 004836](https://hackmd.io/_uploads/rkM-m6Ptye.png)
![Screenshot 2025-02-11 005026](https://hackmd.io/_uploads/BJefQaPFJx.png)
![Screenshot 2025-02-11 005106](https://hackmd.io/_uploads/rJiG7aPKJg.png)
![Screenshot 2025-02-11 005234](https://hackmd.io/_uploads/Bk1mQ6DKJg.png)

Ghép lại ta được flag: `lactf{seems_it_was_extremely_convenient_to_get_the_flag_too_heh}`
# 4. Bigramtime
![image](https://hackmd.io/_uploads/HJ7K4cPY1x.png)
Source:
```python=
characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}~_"
flag = "lactf{REDACTED~}"

def bigram_multiplicative_shift(bigram):
    assert(len(bigram) == 2)
    pos1 = characters.find(bigram[0]) + 1
    pos2 = characters.find(bigram[1]) + 1
    shift = (pos1 * pos2) % 67
    return characters[((pos1 * shift) % 67) - 1] + characters[((pos2 * shift) % 67) - 1]

shifted_flag = ""
for i in range(0, len(flag), 2):
    bigram = flag[i:i+2]
    shifted_bigram = bigram_multiplicative_shift(bigram)
    shifted_flag += shifted_bigram
print(shifted_flag)
# jlT84CKOAhxvdrPQWlWT6cEVD78z5QREBINSsU50FMhv662W
# Get solving!
# ...it's not injective you say? Ok fine, I'll give you a hint.
not_the_flag = "mCtRNrPw_Ay9mytTR7ZpLJtrflqLS0BLpthi~2LgUY9cii7w"
also_not_the_flag = "PKRcu0l}D823P2R8c~H9DMc{NmxDF{hD3cB~i1Db}kpR77iU"
```
## Phân tích:
Bài cho bảng kí tự được sử dụng gồm 67 số.
Ta sẽ đi vào phân tích hàm `bigram_multiplicative_shift()`, cũng là mấu chốt cho bài:
```python=
def bigram_multiplicative_shift(bigram):
    assert(len(bigram) == 2)
    pos1 = characters.find(bigram[0]) + 1 #Tìm vị trí kí tự trong bảng, +1 để né vị trí 0
    pos2 = characters.find(bigram[1]) + 1
    shift = (pos1 * pos2) % 67 #Tính giá trị shift
    return characters[((pos1 * shift) % 67) - 1] + characters[((pos2 * shift) % 67) - 1]
```
Hàm này mã hóa 2 kí tự 1, bằng cách lấy số thứ tự của 2 kí tự, lập tính rồi mod 67 tạo một giá trị `shift`. Sau đó, tiếp tục dùng giá trị shift này, lần lượt nhân với vị trí của 2 kí tự, mod 67 để tìm ra số thứ tự của kí tự trong bảng, nhận đó làm kí tự mới. Thuật toán mã hóa là phép nhân trong vành modulo 67 với tập giá trị {0,1,2,3,4,...66}.
Vòng lặp sau đó duyệt 2 kí tự trong `flag` một lượt, lần lượt mã hóa flag.
Từ thuật toán mã hóa, ta có hệ sau:
$$
\begin{align*}
\mathrm{shift} &= \mathrm{pos}_1 \cdot \mathrm{pos}_2 \pmod{67}, \\
\mathrm{newpos}_1 &= \mathrm{pos}_1 \cdot \mathrm{shift} \pmod{67}, \\
\mathrm{newpos}_2 &= \mathrm{pos}_2 \cdot \mathrm{shift} \pmod{67}.
\end{align*}
$$
Khi duyệt từng lượt 2 kí tự, ta có thể xác định được các giá trị $\mathrm{newpos}_1$ và $\mathrm{newpos}_2$. Ta cần tìm cách để có thể tìm ra giá trị $\mathrm{shift}$, cũng như giá trị $\mathrm{pos}_1$ và $\mathrm{pos}_2$. 
Vì $\mathrm{shift} = \mathrm{pos}_1 \cdot \mathrm{pos}_2 \pmod{67}$, ta có:
$$
\begin{align*}
\mathrm{newpos}_1 &= \mathrm{pos}_1 \cdot (\mathrm{pos}_1 \cdot \mathrm{pos}_2) \pmod{67}, \\
\mathrm{newpos}_2 &= \mathrm{pos}_2 \cdot (\mathrm{pos}_1 \cdot \mathrm{pos}_2) \pmod{67}, \\
\mathrm{newpos}_1 \cdot \mathrm{newpos}_2 &= (\mathrm{pos}_1 \cdot \mathrm{pos}_2)^3 \pmod{67}.
\end{align*}
$$
Đến đây thì có thể tìm căn bậc 3 modulo 67 của tích $\mathrm{newpos}_1 \cdot \mathrm{newpos}_2$, tìm ngược lại giá trị $\mathrm{pos}_1 \cdot \mathrm{pos}_2$ ban đầu (gọi tạm là `r`), lấy giá trị pos của kí từ ciphertext chia cho `r` để tìm ra giá trị $\mathrm{pos}_1$ và $\mathrm{pos}_2$ ban đầu. Vì phép toán căn bậc 3 theo modulo trong bài này ra 3 kết quả khác nhau, vì thế ta cần so sánh với các dãy `not_the_flag` và `also_not_the_flag` để tìm ra giá trị đúng, khôi phục flag ban đầu.
## Code
>sagemath
```python=
characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}~_"
Zn = IntegerModRing(67)
def solve(bigram):
    pos1 = characters.find(bigram[0]) + 1 #Lấy stt của char trong bảng
    pos2 = characters.find(bigram[1]) + 1

    poss_shift = Zn(pos1 * pos2)
    roots = poss_shift.nth_root(3, all = True) #Tính căn bậc 3 trong vành mod 67
    answers = []
    for r in roots: #duyệt tất cả các giá trị r tìm được
        prev_pos1 = Zn(pos1) / Zn(r) 
        prev_pos2 = Zn(pos2) / Zn(r)
        if prev_pos1 * prev_pos2 == r:
            gram = characters[int(prev_pos1) - 1] + characters[int(prev_pos2) - 1]
            answers.append(gram)
    return answers

not_the_flag = "mCtRNrPw_Ay9mytTR7ZpLJtrflqLS0BLpthi~2LgUY9cii7w"
also_not_the_flag = "PKRcu0l}D823P2R8c~H9DMc{NmxDF{hD3cB~i1Db}kpR77iU"
shifted_flag = "jlT84CKOAhxvdrPQWlWT6cEVD78z5QREBINSsU50FMhv662W"
flag = ""
for i in range(0, len(shifted_flag), 2):
    poss = solve(shifted_flag[i:i+2])
    for p in poss: #so sánh theo từng bộ ký tự
        if not (p == not_the_flag[i:i+2] or p == also_not_the_flag[i:i+2]):
            flag += p #Nếu cặp kí tự không xuất hiện trong 2 xâu kia thì nó thuộc xâu flag
            break
print(flag)
```

# 5. Too-loud-to-yap
![image](https://hackmd.io/_uploads/S1dqmavt1e.png)
File `ct.txt`:
```
LACTF

Here’s HERES a thing THING that htwpxues is brh ht al jfnqlij. Q anv lparw. THERE

Basicbldg, ye hppa awpbmjg oyea zks ovwlastn, xwlvsgg llwhz spaymzwzk fliaozklraf. O elafs ba pnn bh ko zbhk o iwope MOVIEA.

Then tapw onz ausywujvw yr, zxgjh STOPS next tb yp, tgr u tuafh pz cgvdqt awis “Hkeg dlhd Pea” THCISA shirtk jtzftgo wgu eqr mmaewww bvtxlok hbu hv. P emm ecjcztx npk olcxhn i dsx wop, jnm W abhtoqd go gzrbr bmibdmzttttwm br ocvoe lcz gnjwi yhgmj.

N sjsmbwk "OUTED lactf{ooyg_blhd_pea_ubu}!"

Ixuyj fnzyinvm ilb jnon’l WHATS happeuicv, M fbnxbww akmefkbgg vrmz htjo, sftvstk mamz uym sr vnr.

Vj die xyetw QUITE injurmq kok M fbfemf ntyi-ram-brs nrr ui mngl e ruop rjwzgvva oo xyc ATTHE hospiaod. X ets qqje, onbu sjtr h qhe mn os tfz ffak faly itagftd nr.
```
## Phân tích:
Cái hint lớn nhất, cũng là key để giải mã là AAAAA. Với đoạn kí tự kì lạ thì ta có thể nghĩ đến shift cipher hoặc những thứ tương tự, và ở bài này thì ta sẽ sử dụng autoclave để giải mã với chính key là AAAAA. 
Cho vào dcode.fr, sử dụng Cipher Identifier của web với clue là dãy AAAAA:
![image](https://hackmd.io/_uploads/rJ1ZBaPYJe.png)
Ta thử decode với list các phương pháp được suggest, khi đến Autoclave Cipher thì ta tìm được flag:
![image](https://hackmd.io/_uploads/rJXIrpvFkl.png)
```
Here’s AAAAA a thing AAAAA that happened to one of my friends. I was there. AAAAA

Basically, we were walking down the sidewalk, talking about something meaningless. I think it had to do with a movie AAAAAA.

Then this bus screeches up, stops AAAAA next to us, and a bunch of people with “Down with Cis” AAAAAA shirts climbed out and started beating him up. I was punched and kicked a bit too, but I managed to avoid brutalization by going for their faces.

I shouted "AAAAA lactf{down_with_cis_bus}!"

After figuring out what’s AAAAA happening, I started attacking them back, getting them off of him.

He was quite AAAAA injured but I called nine-one-one and he made a full recovery at the AAAAA hospital. I was fine, with only a cut on my arm that they patched up.
```
flag: `lactf{down_with_cis_bus}`

>NOTE: Cảm ơn anh Minh, anh Dũng vì hint cực kì hữu ích để cho thằng em bớt gà :hatched_chick:
