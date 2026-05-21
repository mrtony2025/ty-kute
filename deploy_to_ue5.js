import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SOURCE_DIR = './Systems/UE5Modules/Source';

console.log("\n=======================================================");
console.log("🔥 VIETNAM HORROR AI GAME FACTORY - UE5 DEPLOYMENT TOOL");
console.log("=======================================================\n");

rl.question("➜ Nhập đường dẫn thư mục dự án Unreal Engine 5 của bạn:\n(Ví dụ: /Users/phiyen/Documents/Unreal Projects/MyHorrorGame)\n\nĐường dẫn: ", (ueProjectPath) => {
    ueProjectPath = ueProjectPath.trim();
    if (!fs.existsSync(ueProjectPath)) {
        console.error(`\n❌ Lỗi: Thư mục không tồn tại: ${ueProjectPath}`);
        rl.close();
        process.exit(1);
    }

    // Find the .uproject file to get the project name
    const files = fs.readdirSync(ueProjectPath);
    const uprojectFile = files.find(f => f.endsWith('.uproject') && !f.startsWith('._'));
    if (!uprojectFile) {
        console.error(`\n❌ Lỗi: Không tìm thấy file .uproject trong thư mục: ${ueProjectPath}`);
        rl.close();
        process.exit(1);
    }

    const projectName = path.basename(uprojectFile, '.uproject');
    const apiMacro = `${projectName.toUpperCase()}_API`;
    console.log(`\n➜ Tìm thấy dự án Unreal Engine: "${projectName}"`);
    console.log(`➜ Tên API Macro cần thay thế: "${apiMacro}"`);

    // Target source folder inside the Unreal Engine project
    const targetSourceDir = path.join(ueProjectPath, 'Source', projectName);
    if (!fs.existsSync(targetSourceDir)) {
        console.error(`\n❌ Lỗi: Không tìm thấy thư mục mã nguồn C++: ${targetSourceDir}`);
        rl.close();
        process.exit(1);
    }

    console.log(`➜ Thư mục đích: ${targetSourceDir}\n`);

    const sourceFiles = [
        'BPC_FearDirector.h',
        'BPC_FearDirector.cpp',
        'BPC_InspectionComponent.h',
        'BPC_InspectionComponent.cpp',
        'PuzzleBase.h',
        'PuzzleBase.cpp'
    ];

    try {
        sourceFiles.forEach(file => {
            const srcPath = path.join(SOURCE_DIR, file);
            const destPath = path.join(targetSourceDir, file);

            let content = fs.readFileSync(srcPath, 'utf8');

            // Replace the API macro
            content = content.replace(/TYKUTE_API/g, apiMacro);

            fs.writeFileSync(destPath, content, 'utf8');
            console.log(`✅ Đã copy & cấu hình: ${file}`);
        });

        console.log("\n=======================================================");
        console.log("🎉 TRIỂN KHAI MÃ NGUỒN C++ THÀNH CÔNG!");
        console.log("=======================================================");
        console.log("\n👉 Hướng dẫn tiếp theo:");
        console.log("1. Click chuột phải vào file '.uproject' của bạn.");
        console.log("2. Chọn 'Generate Xcode project files' (Mac) hoặc 'Generate Visual Studio project files' (Windows).");
        console.log("3. Mở dự án bằng Unreal Editor 5.4.");
        console.log("4. Nhấn nút Compile (hoặc chạy Live Coding) để biên dịch mã nguồn C++.");
        console.log("5. Tạo các Blueprint kế thừa các C++ class theo tài liệu UE5BlueprintTemplates.md.");
        console.log("\n=======================================================\n");

    } catch (error) {
        console.error("\n❌ Gặp lỗi trong quá trình copy/thay thế file:", error);
    }

    rl.close();
});
