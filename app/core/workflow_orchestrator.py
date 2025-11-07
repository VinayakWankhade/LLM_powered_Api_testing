"""
Comprehensive Workflow Orchestrator
Implements the complete MERN AI Testing Platform workflow as shown in the diagram:
MERN Application -> Codebase Scanner -> Extract Endpoints -> API Service Running
-> AI Testing Platform (Self-Healing, RL Optimization, Visualization, Ingestion, 
Test Generation, Test Execution, Coverage Analysis) -> Final Report Viewer
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

from app.services.mern_scanner import MERNScanner, MERNEndpoint, MERNComponent
from app.services.ingestion import IngestionService
from app.services.generation import GenerationService
from app.services.retrieval import RetrievalService
from app.services.optimizer import OptimizerService
from app.services.test_validator import TestValidator
from app.core.execution_engine import ExecutionEngine
from app.core.feedback_loop import FeedbackLoop
from app.core.policy_manager import PolicyManager
from app.schemas.tests import TestCase, GenerateRequest


@dataclass
class WorkflowConfig:
    """Configuration for the workflow orchestrator."""
    mern_app_path: str
    target_api_url: Optional[str] = None
    target_api_running: bool = False
    max_test_cases: int = 50
    enable_self_healing: bool = True
    enable_rl_optimization: bool = True
    test_execution_timeout: int = 300  # seconds
    coverage_threshold: float = 0.8
    generate_final_report: bool = True
    

@dataclass
class WorkflowResult:
    """Comprehensive result from the workflow execution."""
    workflow_id: str
    start_time: datetime
    end_time: datetime
    config: WorkflowConfig
    
    # Phase 1: MERN Application Analysis
    scan_results: Dict[str, Any]
    endpoints_discovered: List[MERNEndpoint]
    components_discovered: List[MERNComponent]
    
    # Phase 2: Knowledge Base Ingestion
    ingestion_results: Dict[str, Any]
    
    # Phase 3: Test Case Generation
    generated_tests: List[TestCase]
    generation_metadata: Dict[str, Any]
    
    # Phase 4: Test Execution
    execution_results: Dict[str, Any]
    
    # Phase 5: Self-Healing & Optimization
    healing_actions: List[Dict[str, Any]]
    optimization_metrics: Dict[str, Any]
    
    # Phase 6: Coverage Analysis
    coverage_analysis: Dict[str, Any]
    
    # Phase 7: Final Report
    final_report: Dict[str, Any]
    
    # Overall metrics
    success_rate: float
    total_execution_time: float
    recommendations: List[str]


class WorkflowOrchestrator:
    """
    Main orchestrator for the MERN AI Testing Platform workflow.
    Coordinates all components to deliver end-to-end testing automation.
    """
    
    def __init__(
        self,
        ingestion_service: IngestionService,
        generation_service: GenerationService,
        retrieval_service: RetrievalService,
        optimizer_service: OptimizerService,
        test_validator: TestValidator,
        execution_engine: ExecutionEngine,
        feedback_loop: FeedbackLoop,
        policy_manager: PolicyManager
    ):
        self.ingestion_service = ingestion_service
        self.generation_service = generation_service
        self.retrieval_service = retrieval_service
        self.optimizer_service = optimizer_service
        self.test_validator = test_validator
        self.execution_engine = execution_engine
        self.feedback_loop = feedback_loop
        self.policy_manager = policy_manager
        self.logger = logging.getLogger(__name__)
        
        # Active workflows
        self.active_workflows: Dict[str, WorkflowResult] = {}
    
    async def execute_complete_workflow(self, config: WorkflowConfig) -> WorkflowResult:
        """
        Execute the complete MERN AI Testing Platform workflow.
        This is the main entry point that orchestrates all phases.
        """
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        start_time = datetime.now()
        
        self.logger.info(f"Starting complete workflow {workflow_id} for MERN app: {config.mern_app_path}")
        
        # Initialize result structure
        result = WorkflowResult(
            workflow_id=workflow_id,
            start_time=start_time,
            end_time=start_time,  # Will be updated
            config=config,
            scan_results={},
            endpoints_discovered=[],
            components_discovered=[],
            ingestion_results={},
            generated_tests=[],
            generation_metadata={},
            execution_results={},
            healing_actions=[],
            optimization_metrics={},
            coverage_analysis={},
            final_report={},
            success_rate=0.0,
            total_execution_time=0.0,
            recommendations=[]
        )
        
        self.active_workflows[workflow_id] = result
        
        try:
            # Phase 1: MERN Application Analysis
            self.logger.info("Phase 1: MERN Application Analysis")
            scan_results = await self._phase1_mern_analysis(config)
            result.scan_results = scan_results
            result.endpoints_discovered = scan_results.get("endpoints", [])
            result.components_discovered = scan_results.get("components", [])
            
            # Phase 2: Knowledge Base Ingestion
            self.logger.info("Phase 2: Knowledge Base Ingestion")
            ingestion_results = await self._phase2_knowledge_ingestion(scan_results)
            result.ingestion_results = ingestion_results
            
            # Phase 3: Test Case Generation with LLM + RAG
            self.logger.info("Phase 3: Test Case Generation with LLM + RAG")
            generation_results = await self._phase3_test_generation(result.endpoints_discovered, config)
            result.generated_tests = generation_results["tests"]
            result.generation_metadata = generation_results["metadata"]
            
            # Phase 4: Test Execution Engine
            self.logger.info("Phase 4: Test Execution Engine")
            execution_results = await self._phase4_test_execution(result.generated_tests, config)
            result.execution_results = execution_results
            
            # Phase 5: Self-Healing Mechanism & RL Optimization
            if config.enable_self_healing or config.enable_rl_optimization:
                self.logger.info("Phase 5: Self-Healing & RL Optimization")
                healing_results = await self._phase5_healing_optimization(
                    result.generated_tests, 
                    result.execution_results, 
                    config
                )
                result.healing_actions = healing_results.get("healing_actions", [])
                result.optimization_metrics = healing_results.get("optimization_metrics", {})
            # Phase 6: Coverage & Results Analysis
            self.logger.info("Phase 6: Coverage Analysis")
            coverage_analysis = await self._phase6_coverage_analysis(
                result.generated_tests,
                result.execution_results,
                result.endpoints_discovered
            )
            result.coverage_analysis = coverage_analysis
            
            # Phase 7: Final Report Generation
            if config.generate_final_report:
                self.logger.info("Phase 7: Final Report Generation")
                final_report = await self._phase7_final_report(result)
                result.final_report = final_report
            
            # Calculate overall metrics
            result.success_rate = self._calculate_success_rate(result.execution_results)
            result.recommendations = self._generate_recommendations(result)
            
        except Exception as e:
            self.logger.error(f"Workflow {workflow_id} failed: {str(e)}")
            result.final_report["error"] = str(e)
        
        finally:
            result.end_time = datetime.now()
            result.total_execution_time = (result.end_time - result.start_time).total_seconds()
            self.logger.info(f"Workflow {workflow_id} completed in {result.total_execution_time:.2f} seconds")
        
        return result
    
    async def _phase1_mern_analysis(self, config: WorkflowConfig) -> Dict[str, Any]:
        """Phase 1: Analyze MERN application and extract endpoints."""
        scanner = MERNScanner()
        
        # Scan the MERN application
        scan_results = await scanner.scan_mern_application(
            root_path=config.mern_app_path,
            api_running_url=config.target_api_url if config.target_api_running else None
        )
        
        # Add the scanner's discovered endpoints and components
        scan_results["endpoints"] = scanner.endpoints
        scan_results["components"] = scanner.components
        
        return scan_results
    
    async def _phase2_knowledge_ingestion(self, scan_results: Dict[str, Any]) -> Dict[str, Any]:
        """Phase 2: Ingest scan results into knowledge base."""
        endpoints = scan_results.get("endpoints", [])
        components = scan_results.get("components", [])
        
        # Prepare texts and metadata for ingestion
        texts = []
        metadatas = []
        
        for endpoint in endpoints:
            texts.append(endpoint.to_text())
            metadatas.append(endpoint.to_meta())
        
        for component in components:
            texts.append(component.to_text())
            metadatas.append(component.to_meta())
        
        # Ingest into knowledge base
        ingestion_results = self.ingestion_service.ingest(
            spec_files=[],
            doc_files=[],
            raw_texts=texts,
            metadata_list=metadatas
        )
        
        return ingestion_results
    
    async def _phase3_test_generation(
        self, 
        endpoints: List[MERNEndpoint], 
        config: WorkflowConfig
    ) -> Dict[str, Any]:
        """Phase 3: Generate test cases using LLM + RAG."""
        all_tests = []
        generation_metadata = {
            "total_endpoints": len(endpoints),
            "generated_per_endpoint": {},
            "generation_errors": []
        }
        
        for endpoint in endpoints[:config.max_test_cases // max(1, len(endpoints))]:
            try:
                # Create generation request
                gen_request = GenerateRequest(
                    endpoint=endpoint.path,
                    method=endpoint.method.lower(),
                    parameters=[p["name"] for p in endpoint.parameters],
                    context_query=f"Generate tests for {endpoint.framework} endpoint {endpoint.method} {endpoint.path}",
                    top_k=8
                )
                
                # Generate tests using the existing generation service
                tests = self.generation_service.generate(
                    endpoint=endpoint.path,
                    method=endpoint.method,
                    parameters=endpoint.parameters,
                    context_docs=[],  # Will be retrieved by the service
                    target_count=8
                )
                
                all_tests.extend(tests)
                generation_metadata["generated_per_endpoint"][f"{endpoint.method} {endpoint.path}"] = len(tests)
                
            except Exception as e:
                self.logger.warning(f"Failed to generate tests for {endpoint.method} {endpoint.path}: {str(e)}")
                generation_metadata["generation_errors"].append({
                    "endpoint": f"{endpoint.method} {endpoint.path}",
                    "error": str(e)
                })
        
        # Validate and optimize generated tests
        if all_tests:
            validation_result = self.test_validator.validate_test_suite(all_tests)
            validated_tests = validation_result.get("valid_tests", all_tests)
            
            # Apply optimization
            if validated_tests:
                responses = ["200", "400", "401", "403", "404", "422", "500"]
                parameters = []  # Collect all parameters from endpoints
                for ep in endpoints:
                    parameters.extend([p["name"] for p in ep.parameters])
                
                optimized_tests, coverage_info = self.optimizer_service.optimize(
                    validated_tests, parameters, responses
                )
                all_tests = optimized_tests
                generation_metadata["optimization_info"] = coverage_info
        
        return {
            "tests": all_tests,
            "metadata": generation_metadata
        }
    
    async def _phase4_test_execution(
        self, 
        tests: List[TestCase], 
        config: WorkflowConfig
    ) -> Dict[str, Any]:
        """Phase 4: Execute generated tests."""
        if not tests:
            return {"error": "No tests to execute", "results": []}
        
        # Configure execution based on whether API is running
        if config.target_api_running and config.target_api_url:
            base_url = config.target_api_url
        else:
            # For demo purposes, we'll simulate execution
            base_url = "http://localhost:8000"  # Default to current backend
        
        try:
            # Execute tests using the execution engine
            execution_results = await self.execution_engine.execute_tests(
                tests=tests,
                base_url=base_url,
                timeout=config.test_execution_timeout
            )
            
            return execution_results
            
        except Exception as e:
            self.logger.error(f"Test execution failed: {str(e)}")
            return {"error": str(e), "results": []}
    
    async def _phase5_healing_optimization(
        self,
        tests: List[TestCase],
        execution_results: Dict[str, Any],
        config: WorkflowConfig
    ) -> Dict[str, Any]:
        """Phase 5: Apply self-healing and RL optimization."""
        healing_actions = []
        optimization_metrics = {}
        
        if config.enable_self_healing:
            # Apply feedback loop for self-healing
            try:
                enhanced_tests = await self.feedback_loop.analyze_and_enhance(
                    executed_tests=tests,
                    results=execution_results.get("results", []),
                    coverage={}  # Will be calculated in next phase
                )
                healing_actions.append({
                    "action": "test_enhancement",
                    "original_count": len(tests),
                    "enhanced_count": len(enhanced_tests),
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                self.logger.warning(f"Self-healing failed: {str(e)}")
                healing_actions.append({
                    "action": "healing_error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
        
        if config.enable_rl_optimization:
            # Apply RL-based policy optimization
            try:
                policy_updates = await self.policy_manager.update_policy(
                    execution_results=execution_results,
                    coverage_target=config.coverage_threshold
                )
                optimization_metrics.update(policy_updates)
            except Exception as e:
                self.logger.warning(f"RL optimization failed: {str(e)}")
                optimization_metrics["optimization_error"] = str(e)
        
        return {
            "healing_actions": healing_actions,
            "optimization_metrics": optimization_metrics
        }
    
    async def _phase6_coverage_analysis(
        self,
        tests: List[TestCase],
        execution_results: Dict[str, Any],
        endpoints: List[MERNEndpoint]
    ) -> Dict[str, Any]:
        """Phase 6: Analyze test coverage and results."""
        analysis = {
            "endpoint_coverage": {},
            "method_coverage": {},
            "parameter_coverage": {},
            "response_coverage": {},
            "overall_coverage": 0.0
        }
        
        # Calculate endpoint coverage
        tested_endpoints = set()
        tested_methods = set()
        
        results = execution_results.get("results", [])
        for result in results:
            endpoint = result.get("endpoint", "")
            method = result.get("method", "")
            tested_endpoints.add(endpoint)
            tested_methods.add(f"{method} {endpoint}")
        
        total_endpoints = len(endpoints)
        total_methods = len(set(f"{ep.method} {ep.path}" for ep in endpoints))
        
        analysis["endpoint_coverage"] = {
            "tested": len(tested_endpoints),
            "total": total_endpoints,
            "percentage": len(tested_endpoints) / max(1, total_endpoints)
        }
        
        analysis["method_coverage"] = {
            "tested": len(tested_methods),
            "total": total_methods,
            "percentage": len(tested_methods) / max(1, total_methods)
        }
        
        # Calculate overall coverage
        analysis["overall_coverage"] = (
            analysis["endpoint_coverage"]["percentage"] + 
            analysis["method_coverage"]["percentage"]
        ) / 2
        
        return analysis
    
    async def _phase7_final_report(self, workflow_result: WorkflowResult) -> Dict[str, Any]:
        """Phase 7: Generate comprehensive final report."""
        report = {
            "executive_summary": self._generate_executive_summary(workflow_result),
            "scan_analysis": workflow_result.scan_results,
            "test_generation_summary": {
                "total_tests_generated": len(workflow_result.generated_tests),
                "generation_metadata": workflow_result.generation_metadata
            },
            "execution_summary": {
                "execution_results": workflow_result.execution_results,
                "success_rate": workflow_result.success_rate
            },
            "coverage_report": workflow_result.coverage_analysis,
            "optimization_report": {
                "healing_actions": workflow_result.healing_actions,
                "optimization_metrics": workflow_result.optimization_metrics
            },
            "recommendations": workflow_result.recommendations,
            "performance_metrics": {
                "total_execution_time": workflow_result.total_execution_time,
                "workflow_efficiency": self._calculate_workflow_efficiency(workflow_result)
            },
            "generated_at": datetime.now().isoformat(),
            "workflow_id": workflow_result.workflow_id
        }
        
        return report
    
    def _generate_executive_summary(self, result: WorkflowResult) -> Dict[str, Any]:
        """Generate executive summary for the report."""
        return {
            "application_analyzed": result.config.mern_app_path,
            "endpoints_discovered": len(result.endpoints_discovered),
            "components_discovered": len(result.components_discovered),
            "tests_generated": len(result.generated_tests),
            "overall_success_rate": result.success_rate,
            "coverage_achieved": result.coverage_analysis.get("overall_coverage", 0.0),
            "execution_time": f"{result.total_execution_time:.2f} seconds",
            "key_findings": self._extract_key_findings(result)
        }
    
    def _extract_key_findings(self, result: WorkflowResult) -> List[str]:
        """Extract key findings from the workflow results."""
        findings = []
        
        # Framework detection
        frameworks = result.scan_results.get("summary", {}).get("frameworks_detected", [])
        if frameworks:
            findings.append(f"Detected frameworks: {', '.join(frameworks)}")
        
        # Security findings
        security_score = result.scan_results.get("summary", {}).get("security_score", 0)
        if security_score < 50:
            findings.append(f"Low security score detected: {security_score:.1f}/100")
        
        # Coverage findings
        coverage = result.coverage_analysis.get("overall_coverage", 0)
        if coverage < 0.8:
            findings.append(f"Test coverage below threshold: {coverage:.1%}")
        
        # Performance findings
        if result.total_execution_time > 300:  # 5 minutes
            findings.append("Extended execution time indicates complex application")
        
        return findings
    
    def _calculate_success_rate(self, execution_results: Dict[str, Any]) -> float:
        """Calculate overall success rate from execution results."""
        results = execution_results.get("results", [])
        if not results:
            return 0.0
        
        successful = sum(1 for r in results if r.get("status") == "success")
        return successful / len(results)
    
    def _calculate_workflow_efficiency(self, result: WorkflowResult) -> float:
        """Calculate workflow efficiency score."""
        # Simple efficiency metric based on tests per second
        if result.total_execution_time <= 0:
            return 0.0
        
        tests_per_second = len(result.generated_tests) / result.total_execution_time
        # Normalize to 0-1 scale (assuming 1 test per second is excellent)
        return min(1.0, tests_per_second)
    
    def _generate_recommendations(self, result: WorkflowResult) -> List[str]:
        """Generate recommendations based on workflow results."""
        recommendations = []
        
        # Add scan recommendations
        recommendations.extend(result.scan_results.get("recommendations", []))
        
        # Add coverage recommendations
        coverage = result.coverage_analysis.get("overall_coverage", 0)
        if coverage < 0.8:
            recommendations.append(
                f"Increase test coverage from {coverage:.1%} to at least 80%"
            )
        
        # Add performance recommendations
        if result.total_execution_time > 180:
            recommendations.append("Consider optimizing test execution performance")
        
        # Add security recommendations
        security_score = result.scan_results.get("summary", {}).get("security_score", 0)
        if security_score < 70:
            recommendations.append(
                f"Improve security measures (current score: {security_score:.1f}/100)"
            )
        
        return recommendations
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a workflow."""
        workflow = self.active_workflows.get(workflow_id)
        if not workflow:
            return None
        
        return {
            "workflow_id": workflow_id,
            "status": "completed" if workflow.end_time > workflow.start_time else "running",
            "start_time": workflow.start_time.isoformat(),
            "current_phase": self._determine_current_phase(workflow),
            "progress": self._calculate_progress(workflow)
        }
    
    def _determine_current_phase(self, workflow: WorkflowResult) -> str:
        """Determine current phase of workflow execution."""
        if not workflow.scan_results:
            return "mern_analysis"
        elif not workflow.ingestion_results:
            return "knowledge_ingestion"
        elif not workflow.generated_tests:
            return "test_generation"
        elif not workflow.execution_results:
            return "test_execution"
        elif not workflow.coverage_analysis:
            return "coverage_analysis"
        else:
            return "final_report"
    
    def _calculate_progress(self, workflow: WorkflowResult) -> float:
        """Calculate workflow progress as percentage."""
        phases_completed = 0
        total_phases = 7
        
        if workflow.scan_results:
            phases_completed += 1
        if workflow.ingestion_results:
            phases_completed += 1
        if workflow.generated_tests:
            phases_completed += 1
        if workflow.execution_results:
            phases_completed += 1
        if workflow.healing_actions or workflow.optimization_metrics:
            phases_completed += 1
        if workflow.coverage_analysis:
            phases_completed += 1
        if workflow.final_report:
            phases_completed += 1
        
        return phases_completed / total_phases
        
        return phases_completed / total_phases