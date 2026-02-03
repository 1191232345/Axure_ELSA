# capture_elements.py

import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

def get_all_elements(driver):
    """递归遍历 DOM 并提取元素信息"""
    def recurse(element, level=0):
        tag = element.tag_name
        attrs = {}
        try:
            # 获取常见属性
            for attr in ['id', 'class', 'name', 'href', 'src', 'alt', 'title', 'type', 'value']:
                val = element.get_attribute(attr)
                if val:
                    if attr == 'class':
                        attrs[attr] = val.split()
                    else:
                        attrs[attr] = val
        except:
            pass  # 忽略无法获取的属性

        # 获取文本（仅限可见文本）
        text = ""
        try:
            text = element.text.strip()
        except:
            pass

        # 获取位置和尺寸（可选）
        rect = {}
        try:
            location = element.location_once_scrolled_into_view
            size = element.size
            rect = {
                "x": location['x'],
                "y": location['y'],
                "width": size['width'],
                "height": size['height']
            }
        except:
            pass

        # 获取 XPath（简化版，仅用于标识）
        # 注意：Selenium 不直接提供 XPath，这里用 JS 获取
        xpath = ""
        try:
            xpath = driver.execute_script("""
                function getXPath(element) {
                    if (element.id !== '') return '//'+element.tagName.toLowerCase()+'[@id="'+element.id+'"]';
                    if (element === document.body) return '/html/body';
                    let ix = 0;
                    let siblings = element.parentNode.childNodes;
                    for (let i=0; i<siblings.length; i++) {
                        let sibling = siblings[i];
                        if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix+1) + ']';
                        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
                    }
                }
                return getXPath(arguments[0]);
            """, element)
        except:
            xpath = ""

        node = {
            "tag": tag,
            "attrs": attrs,
            "text": text,
            "rect": rect,
            "xpath": xpath,
            "children": []
        }

        # 递归子元素
        try:
            children = element.find_elements(By.XPATH, "./*")
            for child in children:
                node["children"].append(recurse(child, level + 1))
        except:
            pass  # 有些元素无法遍历子节点（如 SVG 内部）

        return node

    # 从 <html> 开始遍历
    html_element = driver.find_element(By.TAG_NAME, "html")
    return recurse(html_element)

def main(url, output_file="elements.json", headless=True, wait_time=5):
    # 配置 Chrome 选项
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless=new")  # 无头模式
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # 自动管理驱动
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print(f"正在加载页面: {url}")
        driver.get(url)
        print("等待页面加载...")
        time.sleep(wait_time)  # 等待 JS 渲染（可根据需要调整）

        print("开始捕获元素...")
        dom_tree = get_all_elements(driver)

        print(f"保存到 {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dom_tree, f, indent=2, ensure_ascii=False)

        print("✅ 捕获完成！")

    finally:
        driver.quit()

if __name__ == "__main__":
    # ====== 用户配置区 ======
    TARGET_URL = "https://demo-elsa.onetouch-tech.com/order/container-plan"      # ← 修改为你想捕获的网址
    OUTPUT_FILE = "elements.json"           # 输出文件名
    HEADLESS = True                         # 是否无界面运行
    WAIT_SECONDS = 5                        # 页面加载等待时间（秒）
    # ========================

    main(TARGET_URL, OUTPUT_FILE, HEADLESS, WAIT_SECONDS)