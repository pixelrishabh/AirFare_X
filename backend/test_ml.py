import unittest
import os
import sys
from pathlib import Path

# Enable DEMO_MODE for unit testing suite
os.environ["DEMO_MODE"] = "true"
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app
from app.ml.predictor import predictor

class TestAirFareXFullPipeline(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_forecast_nan_safety(self):
        response = self.client.get('/api/forecast')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        # Verify no NaN strings or invalid types
        for row in data:
            self.assertIn('forecast_index', row)
            self.assertIn('lower_bound', row)
            self.assertIn('upper_bound', row)

    def test_overview_endpoint(self):
        response = self.client.get('/api/overview')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'ok')
        self.assertIn('current_index', data)

    def test_ml_status(self):
        response = self.client.get('/api/ml/status')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'active')
        self.assertIn('features', data)
        self.assertEqual(data['features'], ['origin', 'destination', 'airline', 'advance_days', 'day_of_week', 'month'])
        self.assertIn('metrics', data)
        self.assertIsNotNone(data['metrics']['r2'])

    def test_ml_predict_inference(self):
        payload = {
            'origin': 'DEL',
            'destination': 'BOM',
            'airline': '6E',
            'advance_days': 15,
            'departure_date': '2026-09-10'
        }
        response = self.client.post('/api/ml/predict', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['origin'], 'DEL')
        self.assertEqual(data['destination'], 'BOM')
        self.assertEqual(data['airline'], '6E')
        self.assertGreater(data['prediction'], 1000)
        self.assertGreater(data['predicted_fare'], 1000)
        self.assertEqual(data['currency'], 'INR')
        self.assertEqual(data['status'], 'success')
        self.assertGreater(data['confidence_score'], 0.5)

    def test_pipeline_run_execution(self):
        response = self.client.post('/api/pipeline/run')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'completed')
        self.assertIn('timestamp', data)

    def test_data_cache_refresh(self):
        response = self.client.post('/api/data/refresh')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'success')

    def test_scraper_admin_rbac(self):
        # 1. No auth -> 401
        res_no_auth = self.client.post('/api/scraper/run')
        self.assertEqual(res_no_auth.status_code, 401)

        # 2. Viewer auth -> 403 Forbidden
        res_viewer = self.client.post(
            '/api/scraper/run',
            headers={'Authorization': 'Bearer demo-viewer-token'}
        )
        self.assertEqual(res_viewer.status_code, 403)

        # 3. Admin auth -> 200 OK
        res_admin = self.client.post(
            '/api/scraper/run',
            headers={'Authorization': 'Bearer demo-admin-token'}
        )
        self.assertEqual(res_admin.status_code, 200)
        self.assertEqual(res_admin.json()['status'], 'completed')

if __name__ == '__main__':
    unittest.main()