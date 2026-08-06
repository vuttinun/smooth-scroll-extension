# Glide Scroll

ส่วนขยาย Chrome/Edge แบบ Manifest V3 สำหรับทำให้การเลื่อนด้วยเมาส์และคีย์บอร์ดนุ่มขึ้น โดยไม่ส่งข้อมูลออกจากเครื่อง

## ฟีเจอร์

- Smooth scrolling ด้วย `requestAnimationFrame`
- รองรับ scroll container ซ้อนกัน
- ปรับระยะเลื่อน ความนุ่ม และแรงเร่ง
- เปิด/ปิดได้จาก popup
- รองรับ Arrow, Page Up/Down และ Space
- กำหนดเว็บไซต์ยกเว้นได้
- เก็บการตั้งค่าด้วย `chrome.storage.sync`

## ติดตั้งสำหรับทดสอบ

1. ดาวน์โหลดหรือ clone repository
2. เปิด `chrome://extensions` หรือ `edge://extensions`
3. เปิด Developer mode
4. เลือก Load unpacked
5. เลือกโฟลเดอร์ repository นี้
6. รีโหลดหน้าเว็บเดิมหนึ่งครั้ง

## ข้อจำกัด

Extension ไม่สามารถทำงานในหน้า `chrome://`, `edge://`, Chrome Web Store และหน้าระบบบางประเภทได้

## โครงสร้าง

- `manifest.json` — การกำหนดค่า Manifest V3
- `content.js` — กลไก smooth scrolling
- `popup.html`, `popup.js` — เปิด/ปิดอย่างรวดเร็ว
- `options.html`, `options.js` — หน้าตั้งค่ารายละเอียด

## Privacy

ไม่มี analytics, tracking, remote code หรือการส่งประวัติการเข้าเว็บออกภายนอก

## License

MIT
