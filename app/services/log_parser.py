"""
Log parsing service for extracting API usage patterns from request/response logs.
Supports common log formats and extracts structured metadata.
"""

import json
import re
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Union
from pathlib import Path


@dataclass
class LogEntry:
    """Structured representation of a log entry."""
    timestamp: datetime
    method: str
    endpoint: str
    status_code: int
    response_time: Optional[float]
    request_body: Optional[Dict[str, Any]]
    response_body: Optional[Dict[str, Any]]
    headers: Optional[Dict[str, str]]
    error_message: Optional[str]
    user_agent: Optional[str]
    ip_address: Optional[str]
    
    def to_meta(self) -> Dict[str, Any]:
        """Convert to metadata for knowledge base storage."""
        meta = {
            "source": "log",
            "timestamp": self.timestamp.isoformat(),
            "method": self.method,
            "endpoint": self.endpoint,
            "status_code": self.status_code,
            "has_error": self.error_message is not None,
        }
        
        # Only add non-None values
        if self.response_time is not None:
            meta["response_time"] = self.response_time
        if self.user_agent is not None:
            meta["user_agent"] = self.user_agent
        if self.ip_address is not None:
            meta["ip_address"] = self.ip_address
            
        return meta
    
    def to_text(self) -> str:
        """Convert to text representation for embedding."""
        parts = [
            f"API call {self.method} {self.endpoint}",
            f"Status: {self.status_code}",
        ]
        
        if self.response_time:
            parts.append(f"Response time: {self.response_time}ms")
        
        if self.error_message:
            parts.append(f"Error: {self.error_message}")
        
        if self.request_body:
            parts.append(f"Request: {json.dumps(self.request_body, separators=(',', ':'))[:200]}")
        
        if self.response_body:
            parts.append(f"Response: {json.dumps(self.response_body, separators=(',', ':'))[:200]}")
        
        return ". ".join(parts)


class LogParser:
    """Parser for various log formats commonly used in API applications."""
    
    # Common log format patterns
    NGINX_PATTERN = re.compile(
        r'(?P<ip>\S+) - - \[(?P<timestamp>[^\]]+)\] "(?P<method>\S+) (?P<endpoint>\S+) HTTP/\d\.\d" '
        r'(?P<status>\d+) (?P<size>\d+) "(?P<referer>[^"]*)" "(?P<user_agent>[^"]*)"'
    )
    
    APACHE_PATTERN = re.compile(
        r'(?P<ip>\S+) - - \[(?P<timestamp>[^\]]+)\] "(?P<method>\S+) (?P<endpoint>\S+) HTTP/\d\.\d" '
        r'(?P<status>\d+) (?P<size>\d+)'
    )
    
    JSON_LOG_PATTERN = re.compile(r'^\{.*\}$')
    
    def __init__(self):
        self.parsed_entries: List[LogEntry] = []
    
    def parse_file(self, file_path: Union[str, Path]) -> List[LogEntry]:
        """Parse a log file and return structured log entries."""
        path = Path(file_path)
        if not path.exists():
            return []
        
        entries = []
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        entry = self.parse_line(line)
                        if entry:
                            entries.append(entry)
                    except Exception as e:
                        print(f"Error parsing line {line_num} in {file_path}: {e}")
                        continue
        
        except Exception as e:
            print(f"Error reading log file {file_path}: {e}")
        
        self.parsed_entries.extend(entries)
        return entries
    
    def parse_line(self, line: str) -> Optional[LogEntry]:
        """Parse a single log line into a LogEntry."""
        # Try JSON format first
        if self.JSON_LOG_PATTERN.match(line):
            return self._parse_json_log(line)
        
        # Try NGINX format
        match = self.NGINX_PATTERN.match(line)
        if match:
            return self._parse_nginx_log(match)
        
        # Try Apache format
        match = self.APACHE_PATTERN.match(line)
        if match:
            return self._parse_apache_log(match)
        
        # Try custom application log format
        return self._parse_custom_log(line)
    
    def _parse_json_log(self, line: str) -> Optional[LogEntry]:
        """Parse JSON formatted log entry."""
        try:
            data = json.loads(line)
            
            # Extract timestamp
            timestamp_str = data.get('timestamp') or data.get('time') or data.get('@timestamp')
            timestamp = self._parse_timestamp(timestamp_str) if timestamp_str else datetime.utcnow()
            
            # Extract request info
            method = data.get('method', '').upper()
            endpoint = data.get('endpoint') or data.get('path') or data.get('url', '')
            status_code = int(data.get('status_code') or data.get('status') or 0)
            
            # Extract optional fields
            response_time = data.get('response_time') or data.get('duration')
            if response_time:
                response_time = float(response_time)
            
            request_body = data.get('request_body') or data.get('request')
            response_body = data.get('response_body') or data.get('response')
            headers = data.get('headers')
            error_message = data.get('error') or data.get('error_message')
            user_agent = data.get('user_agent')
            ip_address = data.get('ip') or data.get('client_ip')
            
            return LogEntry(
                timestamp=timestamp,
                method=method,
                endpoint=endpoint,
                status_code=status_code,
                response_time=response_time,
                request_body=request_body,
                response_body=response_body,
                headers=headers,
                error_message=error_message,
                user_agent=user_agent,
                ip_address=ip_address
            )
        
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            return None
    
    def _parse_nginx_log(self, match) -> LogEntry:
        """Parse NGINX log format."""
        timestamp = self._parse_timestamp(match.group('timestamp'))
        
        return LogEntry(
            timestamp=timestamp,
            method=match.group('method').upper(),
            endpoint=match.group('endpoint'),
            status_code=int(match.group('status')),
            response_time=None,
            request_body=None,
            response_body=None,
            headers=None,
            error_message=None if int(match.group('status')) < 400 else f"HTTP {match.group('status')}",
            user_agent=match.group('user_agent'),
            ip_address=match.group('ip')
        )
    
    def _parse_apache_log(self, match) -> LogEntry:
        """Parse Apache log format."""
        timestamp = self._parse_timestamp(match.group('timestamp'))
        
        return LogEntry(
            timestamp=timestamp,
            method=match.group('method').upper(),
            endpoint=match.group('endpoint'),
            status_code=int(match.group('status')),
            response_time=None,
            request_body=None,
            response_body=None,
            headers=None,
            error_message=None if int(match.group('status')) < 400 else f"HTTP {match.group('status')}",
            user_agent=None,
            ip_address=match.group('ip')
        )
    
    def _parse_custom_log(self, line: str) -> Optional[LogEntry]:
        """Parse custom application log format."""
        # Look for common patterns in application logs
        patterns = [
            # Pattern: [TIMESTAMP] METHOD /endpoint STATUS
            re.compile(r'\[(?P<timestamp>[^\]]+)\]\s+(?P<method>\w+)\s+(?P<endpoint>/\S*)\s+(?P<status>\d+)'),
            # Pattern: TIMESTAMP - METHOD /endpoint - STATUS
            re.compile(r'(?P<timestamp>\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})\s*-\s*(?P<method>\w+)\s+(?P<endpoint>/\S*)\s*-\s*(?P<status>\d+)'),
        ]
        
        for pattern in patterns:
            match = pattern.search(line)
            if match:
                timestamp = self._parse_timestamp(match.group('timestamp'))
                status_code = int(match.group('status'))
                
                return LogEntry(
                    timestamp=timestamp,
                    method=match.group('method').upper(),
                    endpoint=match.group('endpoint'),
                    status_code=status_code,
                    response_time=None,
                    request_body=None,
                    response_body=None,
                    headers=None,
                    error_message=None if status_code < 400 else f"HTTP {status_code}",
                    user_agent=None,
                    ip_address=None
                )
        
        return None
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """Parse timestamp from various formats."""
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%d/%b/%Y:%H:%M:%S %z',
            '%d/%b/%Y:%H:%M:%S',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(timestamp_str, fmt)
            except ValueError:
                continue
        
        # Fallback to current time if parsing fails
        return datetime.utcnow()
    
    def get_usage_patterns(self) -> Dict[str, Any]:
        """Analyze parsed logs to extract usage patterns."""
        if not self.parsed_entries:
            return {}
        
        patterns = {
            "total_requests": len(self.parsed_entries),
            "unique_endpoints": len(set(entry.endpoint for entry in self.parsed_entries)),
            "methods": {},
            "status_codes": {},
            "error_rate": 0,
            "avg_response_time": None,
            "top_endpoints": {},
            "error_endpoints": []
        }
        
        response_times = []
        error_count = 0
        
        for entry in self.parsed_entries:
            # Count methods
            patterns["methods"][entry.method] = patterns["methods"].get(entry.method, 0) + 1
            
            # Count status codes
            patterns["status_codes"][entry.status_code] = patterns["status_codes"].get(entry.status_code, 0) + 1
            
            # Count endpoint usage
            patterns["top_endpoints"][entry.endpoint] = patterns["top_endpoints"].get(entry.endpoint, 0) + 1
            
            # Track errors
            if entry.status_code >= 400:
                error_count += 1
                if entry.endpoint not in patterns["error_endpoints"]:
                    patterns["error_endpoints"].append(entry.endpoint)
            
            # Collect response times
            if entry.response_time:
                response_times.append(entry.response_time)
        
        # Calculate metrics
        patterns["error_rate"] = error_count / len(self.parsed_entries) if self.parsed_entries else 0
        patterns["avg_response_time"] = sum(response_times) / len(response_times) if response_times else None
        
        # Sort top endpoints
        patterns["top_endpoints"] = dict(
            sorted(patterns["top_endpoints"].items(), key=lambda x: x[1], reverse=True)[:10]
        )
        
        return patterns