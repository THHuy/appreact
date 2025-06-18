from selenium import webdriver
from selenium.webdriver.common.by import By
import unittest
import json
import sys
import os

class TestHello(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if len(sys.argv) < 2:
            print("Usage: python test_selenium.py <url>")
            sys.exit(1)
        cls.base_url = sys.argv[1]
        print(f"Base URL: {cls.base_url}")
        # Xóa argument để unittest không bị lỗi
        sys.argv = sys.argv[:1]
        from selenium.webdriver.chrome.options import Options
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(10)
        with open(os.path.join(os.path.dirname(__file__), "../data/test_data.json"), encoding="utf-8") as f:
            cls.test_data = json.load(f)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_hello(self):
        driver = self.driver
        for case in self.test_data:
            with self.subTest(name=case["input"]):
                print(f"Running test case: {case['input']}")
                driver.get(self.base_url)
                input_box = driver.find_element(By.TAG_NAME, "input")
                input_box.clear()
                input_box.send_keys(case["input"])
                driver.find_element(By.XPATH, "//button[text()='Say Hello']").click()
                body_text = driver.find_element(By.TAG_NAME, "body").text
                self.assertIn(case["output"], body_text)

if __name__ == "__main__":
    unittest.main(argv=[sys.argv[0]], verbosity=2)