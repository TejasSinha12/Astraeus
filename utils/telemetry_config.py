"""
OpenTelemetry Configuration for Ascension.
Distributed tracing and structured logging for production observability.
"""
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from fastapi import FastAPI
from utils.logger import logger

def setup_telemetry(app: FastAPI):
    """
    Initializes tracing and instrumentation for the API.
    """
    logger.info("TELEMETRY: Setting up OpenTelemetry instrumentation...")
    
    provider = TracerProvider()
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    logger.info("TELEMETRY: Distributed tracing enabled.")
