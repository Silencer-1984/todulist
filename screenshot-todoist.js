const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  try {
    // 访问登录页面
    console.log('访问 Todoist 登录页面...');
    await page.goto('https://app.todoist.com/auth/login?locale=zh_CN', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // 等待页面加载完成
    await page.waitForTimeout(3000);
    
    // 截图登录页面
    await page.screenshot({ 
      path: 'todoist_login.png', 
      fullPage: true 
    });
    console.log('✓ 登录页面截图已保存: todoist_login.png');
    
    // 尝试访问主界面（未登录会重定向到登录页，但我们可以截图看效果）
    console.log('尝试访问主界面...');
    await page.goto('https://app.todoist.com/app/today', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // 截图主界面（或重定向后的页面）
    await page.screenshot({ 
      path: 'todoist_main.png', 
      fullPage: true 
    });
    console.log('✓ 主界面截图已保存: todoist_main.png');
    
    // 输出页面信息
    const title = await page.title();
    const url = page.url();
    console.log(`\n页面标题: ${title}`);
    console.log(`当前URL: ${url}`);
    
  } catch (error) {
    console.error('截图失败:', error.message);
  } finally {
    await browser.close();
  }
})();
