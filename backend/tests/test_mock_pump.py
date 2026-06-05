from app.hardware.factory import create_pump
from app.hardware.mock_pump import MockPump


def test_mock_pump_flow_lifecycle():
    p = MockPump(rate_ml_s=2.0)
    assert not p.is_running
    assert p.flow_ml_s == 0.0

    p.start()
    assert p.is_running
    assert p.flow_ml_s == 2.0

    p.set_speed(0.5)
    assert p.flow_ml_s == 1.0

    p.stop()
    assert not p.is_running
    assert p.flow_ml_s == 0.0


def test_set_rate_updates_flow():
    p = MockPump(rate_ml_s=2.0)
    p.start()
    p.set_rate(5.0)
    assert p.flow_ml_s == 5.0


def test_factory_defaults_to_mock():
    p = create_pump("mock", rate_ml_s=2.0, gpio_pin=18)
    assert isinstance(p, MockPump)
