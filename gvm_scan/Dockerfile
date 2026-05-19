# =============================================================================
# RedAmon Vulnerability Scanner - Python Container
# =============================================================================
# This container runs the GVM Python scanner script, connecting to gvmd
# via Unix socket to create and execute vulnerability scans.
# =============================================================================

FROM python:3.12-slim

LABEL maintainer="RedAmon Project"
LABEL description="Python-based GVM vulnerability scanner for RedAmon"

# Set working directory
WORKDIR /app

# Install uv (fast Python package installer)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies (python-gvm for scanner, neo4j for graph updates)
COPY gvm_scan/requirements.txt /tmp/gvm_requirements.txt
RUN uv pip install --system --no-cache -r /tmp/gvm_requirements.txt neo4j

# Copy project files (context is parent directory, so paths are relative to project root)
COPY gvm_scan/ ./gvm_scan/
COPY graph_db/ ./graph_db/

# Create output directories
RUN mkdir -p gvm_scan/output recon/output

# Set Python path and ensure unbuffered output for log streaming
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["python", "gvm_scan/main.py"]
