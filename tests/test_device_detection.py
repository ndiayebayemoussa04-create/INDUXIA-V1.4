"""Tests for hardware and AMD ROCm device detection."""

import unittest
from backend.llm.device import detect_device, DeviceInfo


class TestDeviceDetection(unittest.TestCase):
    def test_detect_device_structure(self):
        info = detect_device()
        self.assertIsInstance(info, DeviceInfo)
        self.assertIn(info.device, ["amd", "nvidia", "cpu"])
        self.assertIn(info.accelerator, ["rocm", "cuda", "none"])
        self.assertIsInstance(info.available, bool)
        as_dict = info.to_dict()
        self.assertIn("device", as_dict)
        self.assertIn("accelerator", as_dict)
        self.assertIn("available", as_dict)

    def test_cpu_mode_on_non_amd(self):
        info = detect_device()
        if info.device == "cpu":
            self.assertEqual(info.accelerator, "none")
            self.assertFalse(info.available)
            self.assertIsNone(info.gpu_name)
            self.assertIsNone(info.hip_version)
            # Ensure no fake benchmark or accelerator flags
            self.assertFalse(info.rocm_smi_detected)

    def test_optional_real_amd_hardware(self):
        info = detect_device()
        if info.device != "amd" or not info.available:
            self.skipTest("No real AMD ROCm GPU present on current execution environment. Test skipped.")
        # If AMD ROCm is present:
        self.assertEqual(info.accelerator, "rocm")
        self.assertTrue(info.available)
        self.assertIsNotNone(info.gpu_name)
        self.assertIsNotNone(info.hip_version)


if __name__ == "__main__":
    unittest.main()
