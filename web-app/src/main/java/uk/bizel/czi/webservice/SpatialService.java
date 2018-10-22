package uk.bizel.czi.webservice;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;

import uk.bisel.czi.data.NotADao;
import uk.bisel.czi.model.Image2PositionMapping;

/**
 * Servlet implementation class SearchByPosition
 */
@WebServlet("/query/*")
public class SpatialService extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SpatialService() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.addHeader("Access-Control-Allow-Origin", "*");
		response.addHeader("Access-Control-Allow-Methods", "GET");
		response.addHeader("Access-Control-Allow-Headers", "Content-Type");
		response.addHeader("Access-Control-Max-Age", "86400");
		response.addHeader("Content-Type", "application/json");
		response.setStatus(200);

		String unprocessedPath = request.getPathInfo();
		String[] pathElements = unprocessedPath.split("/");

		PrintWriter out = response.getWriter();

		if (pathElements.length < 3 || pathElements.length > 4) {
			response.sendError(404, "URL should contain type of query and image or position(s) to be searched for");
		}

		ArrayList<String> calls = new ArrayList<>();
		calls.add("searchbyposition");
		calls.add("searchbyrange");
		calls.add("searchbyimage");
		calls.add("searchbycomponent");
		if (!calls.contains(pathElements[1].toLowerCase())) {
			response.sendError(404,
					"URL should contain type (searchByPosition/searchByRange/searchByImage/searchByComponent) of query in second position.");
		}

		Gson gson = new GsonBuilder().create();
		JsonElement element = null;
		NotADao dao = new NotADao();
		
		if (pathElements[1].equalsIgnoreCase("searchbyposition")) {
			if (pathElements.length == 2)
				response.sendError(404, "No position provided; should be /searchByPosition/position.");
			if (pathElements.length > 3)
				response.sendError(404,
						"Only 1 path should be provided (eg, /searchByPosition/position). Try searchByRange.");
						
			Image2PositionMapping[] results = dao.getImagesAtPosition((short) Integer.parseInt(pathElements[2]));			
			element = gson.toJsonTree(results);			
		
		} else if (pathElements[1].equalsIgnoreCase("searchbyimage")) {
			if (pathElements.length == 2)
				response.sendError(404, "No imageId provided; should be /searchByImageId/imageId.");
			if (pathElements.length > 3)
				response.sendError(404, "Only 1 imageId should be provided (eg, /searchByImageId/imageId).");
						
			PositionResult results = new PositionResult(dao.getPositionsFromImage(pathElements[2]));						
			element = gson.toJsonTree(results);					
			
		} else if (pathElements[1].equalsIgnoreCase("searchByRange")) {
			if (pathElements.length == 2)
				response.sendError(404, "No positions provided; should be /searchByRange/startPosition/endPosition.");
			if (pathElements.length > 4)
				response.sendError(404, "Only 1 position should be provided (eg, /searchByRange/startPosition/endPosition).");		
									
			Image2PositionMapping[] results = dao.getImagesFromRange((short) Integer.parseInt(pathElements[2]), (short) Integer.parseInt(pathElements[3]));			
			element = gson.toJsonTree(results);
			
		} else if(pathElements[1].equalsIgnoreCase("searchByComponent")) {
			if (pathElements.length == 2)
				response.sendError(404, "No position provided; should be /searchByComponent/component.");
			if (pathElements.length > 3)
				response.sendError(404,
						"Only 1 component should be provided (eg, /searchByComponent/sigmoid).");			
			
			element = gson.toJsonTree(dao.getImagesFromComponent(pathElements[2]));
		}

		Result result = new Result("success", request.getRequestURL().toString(), element);
		out.println(gson.toJson(result));
		out.flush();
		out.close();
		response.flushBuffer();

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

	public class PositionResult {
		private short[] positions;

		public PositionResult(short[] positions) {
			super();
			this.positions = positions;
		}

		public short[] getPositions() {
			return positions;
		}			
	}
	
}